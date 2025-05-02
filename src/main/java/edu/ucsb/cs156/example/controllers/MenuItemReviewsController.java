package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.MenuItemReviews;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.MenuItemReviewsRepository;

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
 * This is a REST controller for MenuItemReviews
 */

@Tag(name = "MenuItemReviews")
@RequestMapping("/api/menuitemreviews")
@RestController
@Slf4j
public class MenuItemReviewsController extends ApiController {

    @Autowired
    MenuItemReviewsRepository menuItemReviewsRepository;

    /**
     * List all menu item reviews
     * 
     * @return an iterable of MenuItemReviews
     */
    @Operation(summary= "List all menu item reviews")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<MenuItemReviews> allMenuItemReviews() {
        Iterable<MenuItemReviews> reviews = menuItemReviewsRepository.findAll();
        return reviews;
    }

    /**
     * Create a new review
     * 
     * @param itemId        the item being reviewed
     * @param reviewerEmail the email of the reviewer
     * @param stars         the rating given by reviewer
     * @param comments      the comments given by reviewer
     * @param dateReviewed the date
     * @return the saved menuitemreview
     */
    @Operation(summary= "Create a new review")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public MenuItemReviews postMenuItemReview(
            @Parameter(name="itemId") @RequestParam long itemId,
            @Parameter(name="reviewerEmail") @RequestParam String reviewerEmail,
            @Parameter(name="stars") @RequestParam int stars,
            @Parameter(name="comments") @RequestParam String comments,
            @Parameter(name="dateReviewed") @RequestParam("dateReviewed") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateReviewed)
            throws JsonProcessingException {

        // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        // See: https://www.baeldung.com/spring-date-parameters

        log.info("dateReviewed={}", dateReviewed);

        MenuItemReviews menuItemReviews = new MenuItemReviews();
        menuItemReviews.setItemId(itemId);
        menuItemReviews.setReviewerEmail(reviewerEmail);
        menuItemReviews.setStars(stars);
        menuItemReviews.setComments(comments);
        menuItemReviews.setDateReviewed(dateReviewed);

        MenuItemReviews savedMenuItemReviews = menuItemReviewsRepository.save(menuItemReviews);

        return savedMenuItemReviews;
    }

    /**
     * Get a single menuitemreviews by id
     * 
     * @param id the id of the menuitemreviews
     * @return a MenuItemReviews
     */
    @Operation(summary= "Get a single menuitemreviews")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public MenuItemReviews getById(
            @Parameter(name="id") @RequestParam Long id) {
        MenuItemReviews menuItemReviews = menuItemReviewsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(MenuItemReviews.class, id));

        return menuItemReviews;
    }

    /**
     * Update a single menuitemreviews
     * 
     * @param id       id of the menuitemreviews to update
     * @param incoming the new menuitemreviews
     * @return the updated menuitemreviews object
     */
    @Operation(summary= "Update a single menuitemreviews")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public MenuItemReviews updateMenuItemReviews(
            @Parameter(name="id") @RequestParam Long id,
            @RequestBody @Valid MenuItemReviews incoming) {

        MenuItemReviews menuItemReviews = menuItemReviewsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(MenuItemReviews.class, id));

        menuItemReviews.setItemId(incoming.getItemId());
        menuItemReviews.setReviewerEmail(incoming.getReviewerEmail());
        menuItemReviews.setStars(incoming.getStars());
        menuItemReviews.setComments(incoming.getComments());
        menuItemReviews.setDateReviewed(incoming.getDateReviewed());

        menuItemReviewsRepository.save(menuItemReviews);

        return menuItemReviews;
    }

    /**
     * Delete a MenuItemReviews
     * 
     * @param id the id of the menuItemReviews to delete
     * @return a message indicating the menuItemReviews was deleted
     */
    @Operation(summary= "Delete a MenuItemReviews")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteMenuItemReviews(
            @Parameter(name="id") @RequestParam Long id) {
        MenuItemReviews menuItemReviews = menuItemReviewsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(MenuItemReviews.class, id));

        menuItemReviewsRepository.delete(menuItemReviews);
        return genericMessage("MenuItemReviews with id %s deleted".formatted(id));
    }
}