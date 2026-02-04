package com.demo.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final String bucket;
    private final String endpoint;

    public S3StorageService(
            @Value("${app.storage.s3.region:us-east-1}") String region,
            @Value("${app.storage.s3.access-key}") String accessKey,
            @Value("${app.storage.s3.secret-key}") String secretKey,
            @Value("${app.storage.s3.bucket}") String bucket,
            @Value("${app.storage.s3.endpoint:}") String endpoint
    ) {
        this.bucket = bucket;
        this.endpoint = endpoint;

        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ));

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                   .forcePathStyle(true);
        }

        this.s3Client = builder.build();

        log.info("S3 storage initialized with bucket: {}", bucket);
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

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(storedName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));

            String url = getUrl(storedName);

            log.info("File uploaded to S3: {}", storedName);

            return new StoredFile(storedName, url, "s3");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    @Override
    public byte[] download(String storedName) {
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(storedName)
                    .build();

            return s3Client.getObject(getRequest).readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to download file from S3", e);
        }
    }

    @Override
    public void delete(String storedName) {
        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(storedName)
                .build();

        s3Client.deleteObject(deleteRequest);
        log.info("File deleted from S3: {}", storedName);
    }

    @Override
    public String getUrl(String storedName) {
        if (endpoint != null && !endpoint.isBlank()) {
            return endpoint + "/" + bucket + "/" + storedName;
        }
        return "https://" + bucket + ".s3.amazonaws.com/" + storedName;
    }
}
