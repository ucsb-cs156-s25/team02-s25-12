package edu.ucsb.cs156.example.controllers;

import java.time.LocalDateTime;

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

import com.fasterxml.jackson.core.JsonProcessingException;

import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

/**
 * This is a REST controller for Articles
 */

 @Tag(name = "Articles")
 @RequestMapping("/api/articles")
 @RestController
 @Slf4j
 public class ArticlesController extends ApiController {
 
     @Autowired
     ArticlesRepository articlesRepository;
 
     /** 
      * List all Articles
      * 
      * @return an iterable of Articles
      */
     @Operation(summary= "List all articles")
     @PreAuthorize("hasRole('ROLE_USER')")
     @GetMapping("/all")
     public Iterable<Articles> allArticles() {
         Iterable<Articles> articles = articlesRepository.findAll();
         return articles;
     }
 
     /**
      * Create a new article
      * 
      * @param title       title of article
      * @param url         url to the article
      * @param explanation description of article
      * @param email       email of submitter
      * @param dateAdded   the date the article was added
      * @return the saved article
      */
     @Operation(summary= "Create a new article")
     @PreAuthorize("hasRole('ROLE_ADMIN')")
     @PostMapping("/post")
     public Articles postArticles(
             @Parameter(name="title") @RequestParam String title,
             @Parameter(name="url") @RequestParam String url,
             @Parameter(name="explanation") @RequestParam String explanation,
             @Parameter(name="email") @RequestParam String email,
             @Parameter(name="dateAdded", description="date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)") @RequestParam("dateAdded") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateAdded)
             throws JsonProcessingException {
 
         // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
         // See: https://www.baeldung.com/spring-date-parameters
 
         log.info("dateAdded={}", dateAdded);
 
         Articles articles = new Articles();
         articles.setTitle(title);
         articles.setUrl(url);
         articles.setExplanation(explanation);
         articles.setEmail(email);
         articles.setDateAdded(dateAdded);
 
         Articles savedArticles = articlesRepository.save(articles);
 
         return savedArticles;
     }

     /**
      * Get a single article by id
      * 
      * @param id the id of the articles
      * @return a Articles
      */
      @Operation(summary= "Get a single article")
      @PreAuthorize("hasRole('ROLE_USER')")
      @GetMapping("")
      public Articles getById(
              @Parameter(name="id") @RequestParam Long id) {
          Articles articles = articlesRepository.findById(id)
                  .orElseThrow(() -> new EntityNotFoundException(Articles.class, id));
  
          return articles;
      }

     /**
      * Delete an Article
      * 
      * @param id the id of the article to delete
      * @return a message indicating the article was deleted
      */
     @Operation(summary= "Delete an article")
     @PreAuthorize("hasRole('ROLE_ADMIN')")
     @DeleteMapping("")
     public Object deleteArticles(
             @Parameter(name="id") @RequestParam Long id) {
         Articles articles = articlesRepository.findById(id)
                 .orElseThrow(() -> new EntityNotFoundException(Articles.class, id));
 
         articlesRepository.delete(articles);
         return genericMessage("Articles with id %s deleted".formatted(id));
     }

     /**
      * Update a single article
      * 
      * @param id       id of the article to update
      * @param incoming the new article
      * @return the updated article object
      */
     @Operation(summary= "Update a single article")
     @PreAuthorize("hasRole('ROLE_ADMIN')")
     @PutMapping("")
     public Articles updateArticles(
             @Parameter(name="id") @RequestParam Long id,
             @RequestBody @Valid Articles incoming) {
 
         Articles articles = articlesRepository.findById(id)
                 .orElseThrow(() -> new EntityNotFoundException(Articles.class, id));
 
         articles.setTitle(incoming.getTitle());
         articles.setUrl(incoming.getUrl());
         articles.setExplanation(incoming.getExplanation());
         articles.setEmail(incoming.getEmail());
         articles.setDateAdded(incoming.getDateAdded());
 
         articlesRepository.save(articles);
 
         return articles;
     }
 }
 