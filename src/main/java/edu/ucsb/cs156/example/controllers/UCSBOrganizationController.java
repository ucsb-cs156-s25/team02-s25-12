package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
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

/**
 * This is a REST controller for UCSBOrganization
 */

@Tag(name = "UCSBOrganizations")
@RequestMapping("/api/ucsborganizations")
@RestController
@Slf4j
public class UCSBOrganizationController extends ApiController {

    @Autowired
    UCSBOrganizationRepository ucsbOrganizationRepository;

    /**
     * THis method returns a list of all ucsborganizations.
     * @return a list of all ucsborganizations
     */
    @Operation(summary= "List all ucsb organizations")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<UCSBOrganization> allOrganizations() {
        Iterable<UCSBOrganization> organizations = ucsbOrganizationRepository.findAll();
        return organizations;
    }

    /**
     * Get a single UCSBOrganization by its orgCode.
     * @param orgCode  the primary‐key of the org
     * @return the matching UCSBOrganization, or 404 if not found
     */
    @Operation(summary = "Get a single organization")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("") 
    public UCSBOrganization getById(
        @Parameter(name="orgCode") @RequestParam String orgCode
    ) {
        UCSBOrganization org = ucsbOrganizationRepository.findById(orgCode)
            .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));
        return org;
    }

    /**
     * Update a single UCSBOrganization. Accessible only to users with the role "ROLE_ADMIN".
     * @param orgCode       the orgCode (String) – (@Id field)
     * @param incoming the new organization contents
     * @return the updated UCSBOrganization
     */
    @Operation(summary = "Update a single organization")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("") 
    public UCSBOrganization updateOrganization(
            @Parameter(name="id") @RequestParam(name="id") String orgCode,
            @RequestBody @Valid UCSBOrganization incoming) {

        UCSBOrganization org = ucsbOrganizationRepository.findById(orgCode)
            .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));

        org.setOrgTranslationShort(incoming.getOrgTranslationShort());
        org.setOrgTranslation(incoming.getOrgTranslation());
        org.setInactive(incoming.getInactive());

        ucsbOrganizationRepository.save(org);
        return org;
    }

    /**
     * Creates a new UCSBOrganization.  Accessible only to users with the role "ROLE_ADMIN".
     *
     * @param orgCode            the orgCode (String) – this will be the @Id field
     * @param orgTranslationShort a short name/abbreviation
     * @param orgTranslation     the full name
     * @param inactive           whether the org is inactive
     * @return the saved UCSBOrganization
     */
    @Operation(summary = "Create a new organization")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public UCSBOrganization postOrganization(
        @Parameter(name="orgCode") @RequestParam String orgCode,
        @Parameter(name="orgTranslationShort") @RequestParam String orgTranslationShort,
        @Parameter(name="orgTranslation") @RequestParam String orgTranslation,
        @Parameter(name="inactive") @RequestParam boolean inactive
    ) {

        UCSBOrganization org = new UCSBOrganization(orgCode, orgTranslationShort, orgTranslation, inactive);

        UCSBOrganization savedOrg = ucsbOrganizationRepository.save(org);
        return savedOrg;
    }

    /**
     * Delete a UCSBOrganization. Accessible only to users with the role "ROLE_ADMIN".
     * @param orgCode the orgCode (String) (@Id field)
     * @return a message indicating the organization was deleted
     */
    @Operation(summary = "Delete a single organization")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteOrganization(
        @Parameter(name="id") @RequestParam(name="id") String orgCode
    ) {
        UCSBOrganization org = ucsbOrganizationRepository.findById(orgCode)
            .orElseThrow(() -> new EntityNotFoundException(UCSBOrganization.class, orgCode));

        ucsbOrganizationRepository.delete(org);
        return genericMessage("UCSBOrganization with id %s deleted".formatted(orgCode));
    }
}
