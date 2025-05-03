package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
/**
 * This is a REST controller for Recommendation Request
 */

@Tag(name = "RecommendationRequest")
@RequestMapping("/api/recommendationrequest")
@RestController
@Slf4j

public class RecommendationRequestController extends ApiController {
    @Autowired
    RecommendationRequestRepository recommendationRequestRepository;
    
    /**
     * List all Recommendation Requests
     * 
     * @return an iterable of RecommendationRequest
     */
    @Operation(summary= "List all recommendation requests")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<RecommendationRequest> allRecommendationRequests() {
        Iterable<RecommendationRequest> requests = recommendationRequestRepository.findAll();
        return requests;
    }

    /**
     * Create a new Recommendation Request
     *
     * @param explanation
     * @param dateNeeded
     * @param requesterEmail
     * @param done
     * @param dateRequested
     * @param professorEmail
     * @return the created RecommendationRequest
     */
    @Operation(summary = "Create a new recommendation request")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")

    public RecommendationRequest postRecommendationRequest(
            @Parameter(name = "requesterEmail") @RequestParam String requesterEmail,
            @Parameter(name = "explanation") @RequestParam String explanation,
            @Parameter(name = "dateRequested", description = "date (in ISO format, e.g. YYYY-MM-DDTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("dateRequested") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateRequested,
            @Parameter(name = "dateNeeded", description = "date (in ISO format, e.g. YYYY-MM-DDTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("dateNeeded") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateNeeded,
            @Parameter(name = "done") @RequestParam boolean done,
            @Parameter(name = "professorEmail") @RequestParam String professorEmail)
            throws JsonProcessingException {

        log.info("Creating recommendation request: requester={}, professor={}, requestedDate={}, neededDate={}, doneStatus={}",
                requesterEmail, professorEmail, dateRequested, dateNeeded, done);

        RecommendationRequest rRequest = new RecommendationRequest();
        rRequest.setRequesterEmail(requesterEmail);
        rRequest.setExplanation(explanation);
        rRequest.setDateRequested(dateRequested);
        rRequest.setDateNeeded(dateNeeded);
        rRequest.setDone(done);
        rRequest.setProfessorEmail(professorEmail);

        RecommendationRequest savedRecommendationRequest = recommendationRequestRepository.save(rRequest);
        return savedRecommendationRequest;
}
    /**
     * Get a single recommendation request
     * 
     * @param id the id of the recommendation request
     * @return a RecommendationRequest
     */
    @Operation(summary= "Get a single recommendation request")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public RecommendationRequest getById(
            @Parameter(name="id") @RequestParam Long id) {
        RecommendationRequest recReq = recommendationRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        return recReq;
    }

        /**
     * Update a single recommendation request
     * 
     * @param id       id of the recommendation request to update
     * @param incoming the new recommendation request
     * @return the updated recommendation request object
     */
    @Operation(summary= "Update a single recommendation request")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public RecommendationRequest updateRecommendationRequest(
            @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid RecommendationRequest incoming) {

        RecommendationRequest request = recommendationRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        request.setRequesterEmail(incoming.getRequesterEmail());
        request.setExplanation(incoming.getExplanation());
        request.setDateRequested(incoming.getDateRequested());
        request.setDateNeeded(incoming.getDateNeeded());
        request.setDone(incoming.getDone());
        request.setProfessorEmail(incoming.getProfessorEmail());

        recommendationRequestRepository.save(request);
        
        return request;
    }

    /**
     * Delete a recommendation request
     * 
     * @param id the id of the recommendation request to delete
     * @return a message indicating the recommendation request was deleted
     */
    @Operation(summary = "Delete a recommendation request")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteRecommendationRequest(@Parameter(name = "id") @RequestParam Long id) {

        RecommendationRequest toDelete = recommendationRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

        recommendationRequestRepository.delete(toDelete);

        return genericMessage("RecommendationRequest with id %s deleted".formatted(id));
    }
}