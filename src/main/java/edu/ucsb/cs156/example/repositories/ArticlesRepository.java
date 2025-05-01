package edu.ucsb.cs156.example.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import edu.ucsb.cs156.example.entities.Articles;

/**
 * The ArticlesRepository is a repository for Artciles entities.
 */

@Repository
public interface ArticlesRepository extends CrudRepository<Articles, Long> {}