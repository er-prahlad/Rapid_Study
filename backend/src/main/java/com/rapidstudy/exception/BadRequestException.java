package com.rapidstudy.exception;

/**
 * Exception thrown for bad requests
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
