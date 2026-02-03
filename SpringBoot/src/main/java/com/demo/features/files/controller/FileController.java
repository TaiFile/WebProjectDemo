package com.demo.features.files.controller;

import com.demo.features.files.service.FileService;

import com.demo.common.security.CurrentUser;
import com.demo.common.security.UserPrincipal;
import com.demo.features.files.dto.FileResponse;
import com.demo.features.files.dto.UploadResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "Gerenciamento de arquivos")
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload de arquivo")
    public ResponseEntity<UploadResponse> upload(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file
    ) {
        UploadResponse response = fileService.upload(currentUser.getId(), file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar arquivos do usuÃƒÂ¡rio")
    public ResponseEntity<List<FileResponse>> getUserFiles(@CurrentUser UserPrincipal currentUser) {
        List<FileResponse> response = fileService.getUserFiles(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter informaÃƒÂ§ÃƒÂµes do arquivo")
    public ResponseEntity<FileResponse> getById(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser
    ) {
        FileResponse response = fileService.getById(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download do arquivo")
    public ResponseEntity<byte[]> download(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser
    ) {
        FileResponse fileInfo = fileService.getById(id, currentUser.getId());
        byte[] content = fileService.download(id, currentUser.getId());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileInfo.originalName() + "\"")
                .contentType(MediaType.parseMediaType(fileInfo.mimeType()))
                .body(content);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar arquivo")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @CurrentUser UserPrincipal currentUser
    ) {
        fileService.delete(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
