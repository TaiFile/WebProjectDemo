# Code knowledge graph (read this first)

This project is indexed in Neo4j, database **`webprojectdemo`**, via the `codegraph` MCP server
(tools `codegraph-read_neo4j_cypher` and `codegraph-get_neo4j_schema`, read-only). The graph tells you *where* things are, so you can
open a few line ranges instead of grepping and reading whole files.

## Rules
1. **Query the graph before Grep/Glob.** Use the queries below to find files, functions,
   endpoints and tables. Fall back to Grep only when the graph has no answer.
2. **Open only what the graph points to**: Read with `offset = line_start` and
   `limit = line_end - line_start + 1`. Don't read whole files unless you need to.
3. **Before changing a File/Function/Class/Endpoint/Table, check its `Gotcha` and `Decision`
   nodes** (query 9) and respect them.
4. **If the graph and a file disagree, trust the file.** The graph may be stale (it updates
   on commit). Don't "fix" code to match the graph.
5. **Record what you learn.** When you hit a trap or make/learn a design decision, save it:
   ```bash
   $CODEGRAPH_HOME/.venv/bin/codegraph remember --project webprojectdemo --type gotcha \
     --text "Webhook must return 200 even on unknown payment ids, or MercadoPago retries forever" \
     --target "path/to/file.ts:Class.method"
   $CODEGRAPH_HOME/.venv/bin/codegraph remember --project webprojectdemo --type decision \
     --text "Soft delete products" --reason "orders keep referencing them" --target "path/to/file.ts"
   ```
   Targets: `path`, `path:Symbol`, `path:Class.method`, `endpoint:GET /api/x`, `table:name`,
   `concept:Name` (decisions only). Paths are relative to the repo root.

## Model (short)
- `(:File {path, language, loc, summary, unresolved_imports})-[:DEFINES]->(:Class|:Function)`
- `(:Class {name, kind, line_start, line_end})-[:HAS_METHOD]->(:Function {name, qualname, signature, line_start, line_end, summary})`
- `(:File)-[:IMPORTS]->(:File|:Module)`, `(:Function)-[:CALLS {confidence}]->(:Function)`, `(:Class)-[:INHERITS {type}]->(:Class)`
- `(:Endpoint {method, route, name})-[:HANDLED_BY]->(:Function)` (routes include the global prefix, params as `{id}`)
- `(:Function)-[:READS|WRITES {confidence, via}]->(:Table {name})`, `(:File)-[:DEFINES_TABLE]->(:Table)`, `(:Class)-[:MAPS_TO]->(:Table)`
- `(:Concept)-[:IMPLEMENTED_IN]->(:File)`, `(:Decision)-[:AFFECTS]->(...)`, `(:Gotcha)-[:ABOUT]->(...)`
- `confidence: "low"` = name-based guess or regex; verify before relying on it.

## Ready-to-use queries (replace the values in quotes)

```cypher
// 1. Find a function or method by name (case-insensitive substring)
MATCH (f:Function) WHERE toLower(f.name) CONTAINS toLower('create')
RETURN f.qualname, f.path, f.line_start, f.line_end, f.signature, f.summary
ORDER BY f.path LIMIT 30

// 2. Who calls X?
MATCH (caller:Function)-[r:CALLS]->(f:Function {name: 'findById'})
WHERE f.path CONTAINS 'products'
RETURN caller.qualname, caller.path, caller.line_start, r.confidence, f.qualname, f.path

// 3. What does file Y import (local files + external modules)?
MATCH (:File {path: 'NestJs/src/features/products/products.service.ts'})-[:IMPORTS]->(d)
RETURN labels(d)[0] AS kind, coalesce(d.path, d.name) AS target ORDER BY kind, target

// 4. Impact of changing Z: callers up to 3 hops, plus the endpoints that reach it
MATCH (z:Function {qualname: 'ProductsRepository.findById'})
MATCH p = (caller:Function)-[:CALLS*1..3]->(z)
WITH z, caller, min(length(p)) AS hops
OPTIONAL MATCH (e:Endpoint)-[:HANDLED_BY]->(caller)
RETURN hops, caller.qualname, caller.path, caller.line_start, collect(e.name) AS endpoints
ORDER BY hops, caller.path

// 5. Which function handles an endpoint?
MATCH (e:Endpoint)-[:HANDLED_BY]->(f:Function)
WHERE e.method = 'GET' AND e.route CONTAINS '/products'
RETURN e.name, f.qualname, f.path, f.line_start, f.line_end

// 6. Which functions touch a table?
MATCH (f:Function)-[r:READS|WRITES]->(:Table {name: 'products'})
RETURN type(r) AS access, r.confidence, r.via, f.qualname, f.path, f.line_start
ORDER BY access, f.path

// 7. Files for a concept
MATCH (c:Concept)-[:IMPLEMENTED_IN]->(f:File)
WHERE toLower(c.name) CONTAINS toLower('payment')
RETURN c.name, c.description, collect(f.path) AS files

// 8. Full-text search over names, summaries and descriptions (Lucene syntax: fuzzy~, AND, OR)
CALL db.index.fulltext.queryNodes('code_search', 'webhook OR mercadopago~') YIELD node, score
RETURN labels(node)[0] AS kind, coalesce(node.qualname, node.name) AS name, node.path AS path,
       node.line_start AS line, node.summary AS summary, score
LIMIT 20

// 9. Gotchas and decisions on a file (and anything defined in it)
MATCH (f:File {path: 'NestJs/src/features/payments/payments.service.ts'})
OPTIONAL MATCH (f)-[:DEFINES]->(s)
WITH collect(f) + collect(s) AS targets
UNWIND targets AS t
MATCH (m)-[:ABOUT|AFFECTS]->(t)
RETURN DISTINCT labels(m)[0] AS kind, m.text, m.reason, m.date, m.target

// 10. Outline of a file (symbols with line ranges) -- read only the part you need
MATCH (:File {path: 'NestJs/src/features/products/products.service.ts'})-[:DEFINES]->(s)
RETURN labels(s)[0] AS kind, coalesce(s.qualname, s.name) AS name, s.line_start, s.line_end, s.summary
ORDER BY s.line_start
```

## Known blind spots
Dynamic calls (`obj[name]()`, reflection, DI resolved by string tokens), dynamically built
routes, routers mounted with a prefix in another file (Express `app.use('/x', router)`), and
ORM access through generic helpers are not resolved. When the graph shows no callers, confirm
with Grep before concluding something is unused.
