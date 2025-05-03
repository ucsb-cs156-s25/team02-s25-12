package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestControllerTests extends ControllerTestCase {

    @MockBean
    RecommendationRequestRepository recommendationRequestRepository;

    @MockBean
    UserRepository userRepository;

    // Authorization tests for /api/recommendationrequest/admin/all
    @Test
    public void logged_out_users_cannot_get_all() throws Exception {
            mockMvc.perform(get("/api/recommendationrequest/all"))
                            .andExpect(status().is(403)); // logged out users can't get all
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_users_can_get_all() throws Exception {
            mockMvc.perform(get("/api/recommendationrequest/all"))
                            .andExpect(status().is(200)); // logged
    }       

    // Authorization tests for /api/recommendationrequest/post
    // (Perhaps should also have these for put and delete)

    @Test
    public void logged_out_users_cannot_post() throws Exception {
            mockMvc.perform(post("/api/recommendationrequest/post"))
                            .andExpect(status().is(403));
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_regular_users_cannot_post() throws Exception {
            mockMvc.perform(post("/api/recommendationrequest/post"))
                            .andExpect(status().is(403)); // only admins can post
    }

    @WithMockUser(roles = { "USER" })
    @Test
    public void logged_in_user_can_get_all_recommendation_requests() throws Exception {

            // arrange
            LocalDateTime dateReq1 = LocalDateTime.parse("2022-01-03T00:00:00");
            LocalDateTime dateNeeded1 = LocalDateTime.parse("2023-01-03T00:00:00");

            RecommendationRequest RecommendationRequest1 = RecommendationRequest.builder()
                            .requesterEmail("student1@ucsb.edu")
                            .explanation("test1")
                            .dateRequested(dateReq1)
                            .dateNeeded(dateNeeded1)
                            .done(false)
                            .professorEmail("prof1@ucsb.edu")
                            .build();

            LocalDateTime dateReq2 = LocalDateTime.parse("2022-01-04T00:00:00");
            LocalDateTime dateNeeded2 = LocalDateTime.parse("2023-01-04T00:00:00");

            RecommendationRequest RecommendationRequest2 = RecommendationRequest.builder()
                            .requesterEmail("student2@ucsb.edu")
                            .explanation("test1")
                            .dateRequested(dateReq2)
                            .dateNeeded(dateNeeded2)
                            .done(false)
                            .professorEmail("prof2@ucsb.edu")
                            .build();

            ArrayList<RecommendationRequest> expectedDates = new ArrayList<>();
            expectedDates.addAll(Arrays.asList(RecommendationRequest1, RecommendationRequest2));

            when(recommendationRequestRepository.findAll()).thenReturn(expectedDates);

            // act
            MvcResult response = mockMvc.perform(get("/api/recommendationrequest/all"))
                            .andExpect(status().isOk()).andReturn();

            // assert

            verify(recommendationRequestRepository, times(1)).findAll();
            String expectedJson = mapper.writeValueAsString(expectedDates);
            String responseString = response.getResponse().getContentAsString();
            assertEquals(expectedJson, responseString);
    }
            
    @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_recommendation_request() throws Exception {
                // arrange

            LocalDateTime dateReq1 = LocalDateTime.parse("2022-01-03T00:00:00");
            LocalDateTime dateNeeded1 = LocalDateTime.parse("2023-01-03T00:00:00");

            RecommendationRequest RecommendationRequest1 = RecommendationRequest.builder()
                            .requesterEmail("student1@ucsb.edu")
                            .explanation("test1")
                            .dateRequested(dateReq1)
                            .dateNeeded(dateNeeded1)
                            .done(true)
                            .professorEmail("prof1@ucsb.edu")
                            .build();

            when(recommendationRequestRepository.save(eq(RecommendationRequest1))).thenReturn(RecommendationRequest1);

            // act
            MvcResult response = mockMvc.perform(
                            post("/api/recommendationrequest/post")
                                    .param("requesterEmail", "student1@ucsb.edu")
                                    .param("professorEmail", "prof1@ucsb.edu")
                                    .param("explanation", "test1")
                                    .param("dateRequested", "2022-01-03T00:00:00")
                                    .param("dateNeeded", "2023-01-03T00:00:00")
                                    .param("done", "true")
                                    .with(csrf()))
                    .andExpect(status().isOk())
                    .andReturn();

            // assert
            verify(recommendationRequestRepository, times(1)).save(RecommendationRequest1);
            String expectedJson = mapper.writeValueAsString(RecommendationRequest1);
            String responseString = response.getResponse().getContentAsString();
            assertEquals(expectedJson, responseString);
    }

    // tests for getting a single recommendation request by id
        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/recommendationrequest?id=7"))
                                .andExpect(status().is(403)); // logged out users can't get by id
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_cannot_get_by_id_when_id_does_not_exist() throws Exception {

        // arrange
        when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(get("/api/recommendationrequest?id=7"))
                .andExpect(status().isNotFound())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(eq(7L));
        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("RecommendationRequest with id 7 not found", json.get("message"));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_by_id_when_id_exists() throws Exception {

        // arrange
        LocalDateTime dateRequested = LocalDateTime.parse("2022-01-01T00:00:00");
        LocalDateTime dateNeeded = LocalDateTime.parse("2022-02-01T00:00:00");

        RecommendationRequest recommendationRequest = RecommendationRequest.builder()
                .id(7L)
                .requesterEmail("student1@ucsb.edu")
                .professorEmail("prof1@ucsb.edu")
                .explanation("please recommend me")
                .dateRequested(dateRequested)
                .dateNeeded(dateNeeded)
                .done(false)
                .build();

        when(recommendationRequestRepository.findById(eq(7L))).thenReturn(Optional.of(recommendationRequest));

        // act
        MvcResult response = mockMvc.perform(get("/api/recommendationrequest?id=7"))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(eq(7L));
        String expectedJson = mapper.writeValueAsString(recommendationRequest);
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_an_existing_recommendationrequest() throws Exception {
        // arrange
        LocalDateTime dateReq1 = LocalDateTime.parse("2022-01-03T00:00:00");
        LocalDateTime dateNeeded1 = LocalDateTime.parse("2023-01-03T00:00:00");

        RecommendationRequest RecommendationRequest1 = RecommendationRequest.builder()
                .requesterEmail("student1@ucsb.edu")
                .explanation("test1")
                .dateRequested(dateReq1)
                .dateNeeded(dateNeeded1)
                .done(false)
                .professorEmail("prof1@ucsb.edu")
                .build();

        LocalDateTime dateReq2 = LocalDateTime.parse("2022-01-04T00:00:00");
        LocalDateTime dateNeeded2 = LocalDateTime.parse("2023-01-04T00:00:00");

        RecommendationRequest RecommendationRequest2 = RecommendationRequest.builder()
                .requesterEmail("student2@ucsb.edu")
                .explanation("updated explanation")
                .dateRequested(dateReq2)
                .dateNeeded(dateNeeded2)
                .done(true)
                .professorEmail("prof2@ucsb.edu")
                .build();

        String requestBody = mapper.writeValueAsString(RecommendationRequest2);

        when(recommendationRequestRepository.findById(eq(67L))).thenReturn(Optional.of(RecommendationRequest1));

        // act
        MvcResult response = mockMvc.perform(
                        put("/api/recommendationrequest?id=67")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(67L);
        verify(recommendationRequestRepository, times(1)).save(RecommendationRequest2);

        String responseString = response.getResponse().getContentAsString();
        assertEquals(requestBody, responseString);
        }


        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_recommendationrequest_that_does_not_exist() throws Exception {
        // arrange
        LocalDateTime dateRequested = LocalDateTime.parse("2022-01-01T00:00:00");
        LocalDateTime dateNeeded = LocalDateTime.parse("2022-02-01T00:00:00");

        RecommendationRequest editRequest = RecommendationRequest.builder()
                .requesterEmail("student1@ucsb.edu")
                .professorEmail("prof1@ucsb.edu")
                .explanation("edit")
                .dateRequested(dateRequested)
                .dateNeeded(dateNeeded)
                .done(true)
                .build();

        String requestBody = mapper.writeValueAsString(editRequest);

        when(recommendationRequestRepository.findById(eq(999L))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(
                        put("/api/recommendationrequest?id=999")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("utf-8")
                                .content(requestBody)
                                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(999L);

        Map<String, Object> json = responseToJson(response);
        assertEquals("EntityNotFoundException", json.get("type"));
        assertEquals("RecommendationRequest with id 999 not found", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_an_existing_recommendationrequest() throws Exception {
        // arrange ─ setup a record the repo will return
        LocalDateTime dateRequested = LocalDateTime.parse("2022-03-01T00:00:00");
        LocalDateTime dateNeeded   = LocalDateTime.parse("2022-04-01T00:00:00");

        RecommendationRequest rr = RecommendationRequest.builder()
                .id(15L)
                .requesterEmail("student@ucsb.edu")
                .professorEmail("prof@ucsb.edu")
                .explanation("delete me")
                .dateRequested(dateRequested)
                .dateNeeded(dateNeeded)
                .done(false)
                .build();

        when(recommendationRequestRepository.findById(eq(15L))).thenReturn(Optional.of(rr));

        // act
        MvcResult response = mockMvc.perform(
                        delete("/api/recommendationrequest?id=15")
                                .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(15L);
        verify(recommendationRequestRepository, times(1)).delete(rr);

        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 15 deleted", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_delete_recommendationrequest_that_does_not_exist() throws Exception {
        // arrange
        when(recommendationRequestRepository.findById(eq(15L))).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(
                        delete("/api/recommendationrequest?id=15")
                                .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

        // assert
        verify(recommendationRequestRepository, times(1)).findById(15L);
        Map<String, Object> json = responseToJson(response);
        assertEquals("RecommendationRequest with id 15 not found", json.get("message"));
        }
}