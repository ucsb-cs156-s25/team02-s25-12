package edu.ucsb.cs156.example.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity(name = "ucsborganizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UCSBOrganization {

    @Id
    private String orgCode;

    private String orgTranslationShort;

    private String orgTranslation;

    private boolean inactive;

}
