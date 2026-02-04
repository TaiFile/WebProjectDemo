package com.demo.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final Path uploadPath;
    private final String appUrl;

    public LocalStorageService(
            @Value("${app.storage.local.upload-path:./uploads}") String uploadDir,
            @Value("${app.url:http://localhost:3000}") String appUrl
    ) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.appUrl = appUrl;

        try {
            Files.createDirectories(this.uploadPath);
            log.info("Local storage initialized at: {}", this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Override
    public StoredFile upload(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String storedName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.uploadPath.resolve(storedName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String url = appUrl + "/api/files/" + storedName + "/download";

            log.info("File uploaded locally: {}", storedName);

            return new StoredFile(storedName, url, "local");
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public byte[] download(String storedName) {
        try {
            Path filePath = this.uploadPath.resolve(storedName).normalize();
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    @Override
    public void delete(String storedName) {
        try {
            Path filePath = this.uploadPath.resolve(storedName).normalize();
            Files.deleteIfExists(filePath);
            log.info("File deleted locally: {}", storedName);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @Override
    public String getUrl(String storedName) {
        return appUrl + "/api/files/" + storedName + "/download";
    }
}
