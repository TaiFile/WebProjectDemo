# Geolocalização com Google Maps

Este módulo implementa funcionalidades de geolocalização usando a API do Google Maps.

## Configuração

### 1. Obter API Key do Google Maps

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite as seguintes APIs:
   - **Geocoding API** - Para converter endereços em coordenadas
   - **Distance Matrix API** - Para calcular distâncias entre pontos
   - **Places API** - Para autocomplete e detalhes de lugares
4. Crie uma API Key em "Credentials"
5. (Recomendado) Restrinja a API Key para maior segurança

### 2. Configurar Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
GOOGLE_MAPS_API_KEY=sua_api_key_aqui
```

### 3. Executar Migration do Prisma

```bash
npx prisma migrate dev --name add_addresses
```

## Endpoints Disponíveis

### Endereços (CRUD)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/addresses` | Criar novo endereço |
| GET | `/addresses` | Listar endereços do usuário |
| GET | `/addresses/:id` | Buscar endereço por ID |
| PATCH | `/addresses/:id` | Atualizar endereço |
| DELETE | `/addresses/:id` | Deletar endereço |
| PATCH | `/addresses/:id/set-default` | Definir como padrão |

### Geolocalização

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/addresses/geocode` | Converter endereço em coordenadas |
| POST | `/addresses/reverse-geocode` | Converter coordenadas em endereço |
| POST | `/addresses/distance` | Calcular distância entre dois pontos |
| GET | `/addresses/search/autocomplete` | Autocomplete de endereços |
| POST | `/addresses/nearby` | Buscar endereços próximos |
| POST | `/addresses/from-place` | Criar endereço a partir de Place ID |

## Exemplos de Uso

### Criar Endereço

```json
POST /addresses
{
  "label": "Casa",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "isDefault": true
}
```

### Geocodificar Endereço

```json
POST /addresses/geocode
{
  "address": "Av. Paulista, 1000, São Paulo - SP"
}
```

**Resposta:**
```json
{
  "result": {
    "formattedAddress": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100, Brasil",
    "latitude": -23.5632,
    "longitude": -46.6542,
    "placeId": "ChIJ...",
    "street": "Avenida Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "zipCode": "01310-100"
  }
}
```

### Reverse Geocoding

```json
POST /addresses/reverse-geocode
{
  "latitude": -23.5632,
  "longitude": -46.6542
}
```

### Calcular Distância

Usando IDs de endereços salvos:
```json
POST /addresses/distance
{
  "originAddressId": "uuid-do-endereco-origem",
  "destinationAddressId": "uuid-do-endereco-destino"
}
```

Usando coordenadas:
```json
POST /addresses/distance
{
  "originLatitude": -23.5632,
  "originLongitude": -46.6542,
  "destinationLatitude": -23.5505,
  "destinationLongitude": -46.6333
}
```

**Resposta:**
```json
{
  "origin": { "latitude": -23.5632, "longitude": -46.6542 },
  "destination": { "latitude": -23.5505, "longitude": -46.6333 },
  "distance": {
    "distanceInMeters": 3500,
    "distanceInKilometers": 3.5,
    "durationInSeconds": 720,
    "durationText": "12 mins",
    "distanceText": "3,5 km"
  }
}
```

### Autocomplete

```
GET /addresses/search/autocomplete?input=Av Paulista
```

**Resposta:**
```json
{
  "results": [
    {
      "placeId": "ChIJ...",
      "description": "Avenida Paulista, São Paulo - SP, Brasil",
      "mainText": "Avenida Paulista",
      "secondaryText": "São Paulo - SP, Brasil"
    }
  ]
}
```

### Buscar Endereços Próximos

```json
POST /addresses/nearby
{
  "latitude": -23.5632,
  "longitude": -46.6542,
  "radiusInKm": 5
}
```

### Criar Endereço a partir de Place ID

```json
POST /addresses/from-place
{
  "placeId": "ChIJ0WGkg4FEzpQRrlsz_whLqZs",
  "label": "Escritório"
}
```

## Funcionalidades

### GoogleMapsService

| Método | Descrição |
|--------|-----------|
| `geocode(address)` | Converte endereço em coordenadas |
| `reverseGeocode(coords)` | Converte coordenadas em endereço |
| `calculateDistance(origin, dest)` | Calcula distância via rota (Distance Matrix) |
| `calculateStraightLineDistance(origin, dest)` | Calcula distância em linha reta (Haversine) |
| `getPlaceDetails(placeId)` | Obtém detalhes de um lugar |
| `autocomplete(input)` | Autocomplete de endereços |

### Fórmula de Haversine

O serviço inclui cálculo de distância em linha reta usando a fórmula de Haversine, útil quando:
- A API do Google não está disponível
- Você precisa de um cálculo rápido sem custo de API
- Precisa de uma estimativa aproximada

## Custos

A API do Google Maps é paga. Consulte a [tabela de preços](https://developers.google.com/maps/billing-and-pricing/pricing) para detalhes.

| API | Custo (aproximado) |
|-----|-------------------|
| Geocoding | $5.00 / 1000 requests |
| Distance Matrix | $5.00 / 1000 elements |
| Places Autocomplete | $2.83 / 1000 requests |
| Place Details | $17.00 / 1000 requests |

**Dica:** Use session tokens no autocomplete para agrupar requests e reduzir custos.

## Estrutura de Arquivos

```
src/
├── infrastructure/
│   └── geolocation/
│       ├── geolocation.interface.ts    # Interfaces e tipos
│       ├── google-maps.service.ts      # Implementação Google Maps
│       ├── geolocation.module.ts       # Módulo NestJS
│       └── index.ts                    # Exports
│
└── features/
    └── addresses/
        ├── addresses.controller.ts     # Controller REST
        ├── addresses.service.ts        # Lógica de negócio
        ├── addresses.module.ts         # Módulo NestJS
        ├── dtos/
        │   ├── address.dto.ts          # DTOs de criação/atualização
        │   ├── address-response.dto.ts # DTO de resposta
        │   └── geolocation.dto.ts      # DTOs de geolocalização
        └── repositories/
            └── addresses.repository.ts # Acesso ao banco
```

## Model Prisma

```prisma
model Address {
  id               String   @id @default(uuid())
  label            String?
  street           String
  number           String
  complement       String?
  neighborhood     String
  city             String
  state            String
  country          String   @default("Brasil")
  zipCode          String
  latitude         Float?
  longitude        Float?
  formattedAddress String?
  placeId          String?
  isDefault        Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([latitude, longitude])
  @@map("addresses")
}
```
