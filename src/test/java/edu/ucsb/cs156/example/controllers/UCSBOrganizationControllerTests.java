package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.List;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(controllers = UCSBOrganizationController.class)
@Import(TestConfig.class)

public class UCSBOrganizationControllerTests extends ControllerTestCase {

        @MockBean
        UCSBOrganizationRepository ucsbOrganizationRepository;

        @MockBean
        UserRepository userRepository;

        // Authorization tests for GET /api/ucsborganizations/admin/all

        @Test
        public void logged_out_users_cannot_get_all() throws Exception {
                mockMvc.perform(get("/api/ucsborganizations/all"))
                                .andExpect(status().is(403)); // logged out users can't get all
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_all() throws Exception {
                mockMvc.perform(get("/api/ucsborganizations/all"))
                                .andExpect(status().is(200)); // logged
        }

        // Authorization tests for POST /api/ucsborganizations/post

        @Test
        public void logged_out_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/ucsborganizations/post"))
                                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_post() throws Exception {
                mockMvc.perform(post("/api/ucsborganizations/post"))
                                .andExpect(status().is(403)); // only admins can post
        }

        // Tests for PUT

        @Test
        public void logged_out_users_cannot_put() throws Exception {
                mockMvc.perform(put("/api/ucsborganizations?id=whatever"))
                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_put() throws Exception {
                mockMvc.perform(put("/api/ucsborganizations?id=whatever"))
                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_edit_existing_organization() throws Exception {
                UCSBOrganization orig = UCSBOrganization.builder()
                .orgCode("robotics")
                .orgTranslationShort("Robotics Club")
                .orgTranslation("UCSB Robotics Club")
                .inactive(false)
                .build();

                UCSBOrganization edited = UCSBOrganization.builder()
                .orgCode("robotics")
                .orgTranslationShort("Robo Club")
                .orgTranslation("Gaucho Robotics Club")
                .inactive(true)
                .build();

                String requestBody = mapper.writeValueAsString(edited);

                when(ucsbOrganizationRepository.findById(eq("robotics")))
                .thenReturn(Optional.of(orig));

                MvcResult response = mockMvc.perform(
                        put("/api/ucsborganizations?id=robotics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

                verify(ucsbOrganizationRepository, times(1)).findById("robotics");
                verify(ucsbOrganizationRepository, times(1)).save(edited);

                String responseString = response.getResponse().getContentAsString();
                assertEquals(requestBody, responseString);
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_edit_organization_that_does_not_exist() throws Exception {
                UCSBOrganization edited = UCSBOrganization.builder()
                .orgCode("nope")
                .orgTranslationShort("Nope Short")
                .orgTranslation("No Such Organization")
                .inactive(false)
                .build();

                String requestBody = mapper.writeValueAsString(edited);

                when(ucsbOrganizationRepository.findById(eq("nope")))
                .thenReturn(Optional.empty());

                MvcResult response = mockMvc.perform(
                        put("/api/ucsborganizations?id=nope")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("utf-8")
                        .content(requestBody)
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

                verify(ucsbOrganizationRepository, times(1)).findById("nope");
                Map<String, Object> json = responseToJson(response);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("UCSBOrganization with id nope not found", json.get("message"));
        }

        // Functional tests for GET all
        @WithMockUser(roles = { "USER" })
        @Test
        public void test_that_logged_in_user_can_get_all_organizations() throws Exception {
                UCSBOrganization org1 = UCSBOrganization.builder()
                .orgCode("ieee")
                .orgTranslationShort("IEEE at UCSB")
                .orgTranslation("Institute of Electrical and Electronics Engineers")
                .inactive(false)
                .build();

                UCSBOrganization org2 = UCSBOrganization.builder()
                .orgCode("acm")
                .orgTranslationShort("ACM at UCSB")
                .orgTranslation("Association for Computing Machinery")
                .inactive(true)
                .build();

                List<UCSBOrganization> allOrgs = Arrays.asList(org1, org2);
                when(ucsbOrganizationRepository.findAll()).thenReturn(allOrgs);

                MvcResult res = mockMvc.perform(get("/api/ucsborganizations/all"))
                                .andExpect(status().isOk())
                                .andReturn();

                verify(ucsbOrganizationRepository, times(1)).findAll();
                String expectedJson = mapper.writeValueAsString(allOrgs);
                assertEquals(expectedJson, res.getResponse().getContentAsString());
        }

        // Functional test for POST
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_organization() throws Exception {
                UCSBOrganization newOrg = UCSBOrganization.builder()
                .orgCode("codesb")
                .orgTranslationShort("CodersSB")
                .orgTranslation("UCSB Coding Club")
                .inactive(false)
                .build();

                when(ucsbOrganizationRepository.save(eq(newOrg))).thenReturn(newOrg);

                MvcResult res = mockMvc.perform(post("/api/ucsborganizations/post")
                                        .param("orgCode",             "codesb")
                                        .param("orgTranslationShort", "CodersSB")
                                        .param("orgTranslation",      "UCSB Coding Club")
                                        .param("inactive",            "false")
                                        .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();

                verify(ucsbOrganizationRepository, times(1)).save(newOrg);
                String expectedJson = mapper.writeValueAsString(newOrg);
                assertEquals(expectedJson, res.getResponse().getContentAsString());
        }

        // Functional test for POST inactive=true
        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void an_admin_user_can_post_a_new_organization_with_inactive_true() throws Exception {
                UCSBOrganization newOrg = UCSBOrganization.builder()
                .orgCode("chess")
                .orgTranslationShort("Chess Club")
                .orgTranslation("UCSB Chess Club")
                .inactive(true)
                .build();

                when(ucsbOrganizationRepository.save(eq(newOrg))).thenReturn(newOrg);

                MvcResult res = mockMvc.perform(post("/api/ucsborganizations/post")
                                        .param("orgCode",             "chess")
                                        .param("orgTranslationShort", "Chess Club")
                                        .param("orgTranslation",      "UCSB Chess Club")
                                        .param("inactive",            "true")
                                        .with(csrf()))
                                .andExpect(status().isOk())
                                .andReturn();

                verify(ucsbOrganizationRepository, times(1)).save(newOrg);
                String expectedJson = mapper.writeValueAsString(newOrg);
                assertEquals(expectedJson, res.getResponse().getContentAsString());
        }


        @Test
        public void logged_out_users_cannot_get_by_id() throws Exception {
                mockMvc.perform(get("/api/ucsborganizations?orgCode=doesnotmatter"))
                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_can_get_by_id_when_it_exists() throws Exception {
                UCSBOrganization org = UCSBOrganization.builder()
                .orgCode("ieee")
                .orgTranslationShort("IEEE")
                .orgTranslation("Institute of Electrical and Electronics Engineers")
                .inactive(false)
                .build();

                when(ucsbOrganizationRepository.findById(eq("ieee")))
                .thenReturn(Optional.of(org));

                MvcResult result = mockMvc.perform(get("/api/ucsborganizations")
                                        .param("orgCode", "ieee"))
                                        .andExpect(status().isOk())
                                        .andReturn();

                verify(ucsbOrganizationRepository, times(1)).findById("ieee");
                String expectedJson = mapper.writeValueAsString(org);
                assertEquals(expectedJson, result.getResponse().getContentAsString());
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_users_get_404_when_id_not_found() throws Exception {
                when(ucsbOrganizationRepository.findById(eq("nope")))
                .thenReturn(Optional.empty());

                MvcResult result = mockMvc.perform(get("/api/ucsborganizations")
                                        .param("orgCode", "nope"))
                                        .andExpect(status().isNotFound())
                                        .andReturn();

                verify(ucsbOrganizationRepository, times(1)).findById("nope");
                Map<String,Object> json = responseToJson(result);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("UCSBOrganization with id nope not found", json.get("message"));
        }

        // Tests for DELETE

        @Test
        public void logged_out_users_cannot_delete() throws Exception {
                mockMvc.perform(delete("/api/ucsborganizations?id=foo")
                        .with(csrf()))
                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "USER" })
        @Test
        public void logged_in_regular_users_cannot_delete() throws Exception {
                mockMvc.perform(delete("/api/ucsborganizations?id=foo")
                        .with(csrf()))
                .andExpect(status().is(403));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_can_delete_existing_organization() throws Exception {
                // arrange
                UCSBOrganization org = UCSBOrganization.builder()
                .orgCode("robotics")
                .orgTranslationShort("Robotics Club")
                .orgTranslation("UCSB Robotics Club")
                .inactive(false)
                .build();

                when(ucsbOrganizationRepository.findById(eq("robotics")))
                .thenReturn(Optional.of(org));

                // act
                MvcResult result = mockMvc.perform(
                        delete("/api/ucsborganizations?id=robotics")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andReturn();

                // assert
                verify(ucsbOrganizationRepository, times(1)).findById("robotics");
                verify(ucsbOrganizationRepository, times(1)).delete(org);

                Map<String,Object> json = responseToJson(result);
                assertEquals("UCSBOrganization with id robotics deleted", json.get("message"));
        }

        @WithMockUser(roles = { "ADMIN", "USER" })
        @Test
        public void admin_cannot_delete_nonexistent_organization() throws Exception {
                // arrange
                when(ucsbOrganizationRepository.findById(eq("nope")))
                .thenReturn(Optional.empty());

                // act
                MvcResult result = mockMvc.perform(
                        delete("/api/ucsborganizations?id=nope")
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andReturn();

                // assert
                verify(ucsbOrganizationRepository, times(1)).findById("nope");

                Map<String,Object> json = responseToJson(result);
                assertEquals("EntityNotFoundException", json.get("type"));
                assertEquals("UCSBOrganization with id nope not found", json.get("message"));
        }
}