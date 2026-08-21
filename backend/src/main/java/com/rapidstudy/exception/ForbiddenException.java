package com.rapidstudy.exception;

/**
 * Exception thrown when user doesn't have permission
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
