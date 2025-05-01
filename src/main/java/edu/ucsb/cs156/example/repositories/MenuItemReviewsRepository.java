package edu.ucsb.cs156.example.repositories;

import edu.ucsb.cs156.example.entities.MenuItemReviews;

import org.springframework.beans.propertyeditors.StringArrayPropertyEditor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The MenuItemReviewsRepository is a repository for MenuItemReviews entities
 */
@Repository
public interface MenuItemReviewsRepository extends CrudRepository<MenuItemReviews, Long> {
 
}