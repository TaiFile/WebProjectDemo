package com.demo.infrastructure.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StoredFile upload(MultipartFile file);

    byte[] download(String storedName);

    void delete(String storedName);

    String getUrl(String storedName);

    record StoredFile(String storedName, String url, String storageType) {}
}
