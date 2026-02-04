package com.demo.features.files.controller;

import com.demo.features.files.service.FileService;

import com.demo.features.files.dto.FileResponse;
import com.demo.features.files.dto.UploadResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
            Authentication auth,
            @RequestParam("file") MultipartFile file
    ) {
        String userId = auth.getName();
        UploadResponse response = fileService.upload(userId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> getUserFiles(Authentication auth) {
        String userId = auth.getName();
        List<FileResponse> response = fileService.getUserFiles(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getById(
            @PathVariable String id,
            Authentication auth
    ) {
        String userId = auth.getName();
        FileResponse response = fileService.getById(id, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(
            @PathVariable String id,
            Authentication auth
    ) {
        String userId = auth.getName();
        FileResponse fileInfo = fileService.getById(id, userId);
        byte[] content = fileService.download(id, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileInfo.originalName() + "\"")
                .contentType(MediaType.parseMediaType(fileInfo.mimeType()))
                .body(content);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            Authentication auth
    ) {
        String userId = auth.getName();
        fileService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}
