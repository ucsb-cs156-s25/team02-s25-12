package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;

import java.time.LocalDateTime;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestIT {

    @Autowired
    public CurrentUserService currentUserService;

    @Autowired
    public GrantedAuthoritiesService grantedAuthoritiesService;

    @Autowired
    RecommendationRequestRepository recommendationRequestRepository;

    @Autowired
    public MockMvc mockMvc;

    @Autowired
    public ObjectMapper mapper;

    @MockBean
    UserRepository userRepository;

    @WithMockUser(roles = { "USER" })
    @Test
    public void test_logged_in_user_can_get_by_id_when_it_exists() throws Exception {
        // arrange
        RecommendationRequest req = RecommendationRequest.builder()
                .requesterEmail("hungkhuu@ucsb.edu")
                .professorEmail("phtcon@ucsb.edu")
                .explanation("Requesting recommendation")
                .dateRequested(LocalDateTime.parse("2025-05-02T08:00:00"))
                .dateNeeded(LocalDateTime.parse("2025-09-26T08:00:00"))
                .done(false)
                .build();

        recommendationRequestRepository.save(req);

        // act
        MvcResult response = mockMvc.perform(get("/api/recommendationrequest?id=1"))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        String expectedJson = mapper.writeValueAsString(req);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @WithMockUser(roles = { "ADMIN", "USER" })
    @Test
    public void admin_can_post_a_new_recommendation_request() throws Exception {
        // arrange
        RecommendationRequest expected = RecommendationRequest.builder()
                .id(1L)
                .requesterEmail("hungkhuu@ucsb.edu")
                .professorEmail("phtcon@ucsb.edu")
                .explanation("Requesting recommendation")
                .dateRequested(LocalDateTime.parse("2025-05-02T08:00:00"))
                .dateNeeded(LocalDateTime.parse("2025-09-26T08:00:00"))
                .done(false)
                .build();

        // act
        MvcResult response = mockMvc.perform(post("/api/recommendationrequest/post")
                        .param("requesterEmail", "hungkhuu@ucsb.edu")
                        .param("professorEmail", "phtcon@ucsb.edu")
                        .param("explanation", "Requesting recommendation")
                        .param("dateRequested", "2025-05-02T08:00:00")
                        .param("dateNeeded", "2025-09-26T08:00:00")
                        .param("done", "false")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        String expectedJson = mapper.writeValueAsString(expected);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
}
