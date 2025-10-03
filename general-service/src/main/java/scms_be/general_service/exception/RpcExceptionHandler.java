package scms_be.general_service.exception;
import lombok.extern.slf4j.Slf4j;
import scms_be.general_service.model.ErrorResponse;

import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RpcExceptionHandler {

    public ErrorResponse handleRpcException(RpcException ex) {
        log.error("RpcException occurred: Status={}, Message={}", ex.getStatusCode(), ex.getMessage(), ex);
        return new ErrorResponse(ex.getStatusCode(), ex.getMessage());
    }

    public ErrorResponse handleGenericException(Exception ex) {
        log.error("Unexpected exception occurred: {}", ex.getMessage(), ex);
        return new ErrorResponse(500, "Internal server error: " + ex.getMessage());
    }
}
