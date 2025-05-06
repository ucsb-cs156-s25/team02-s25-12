// src/test/java/edu/ucsb/cs156/example/web/RecommendationRequestWebIT.java
package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_recommendationrequest() throws Exception {
    setupUser(true);

    // NAVIGATE
    page.getByText("Recommendation Requests").click();
    page.getByText("Create Recommendation Request").click();

    // CREATE
    assertThat(page.getByText("Create New Recommendation Request")).isVisible();
    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("student@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("prof@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("Letter for grad school");
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2025-05-01T08:00");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2025-06-01T08:00");
    page.getByTestId("RecommendationRequestForm-done").check();
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("student@ucsb.edu");

    // EDIT
    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Recommendation Request")).isVisible();
    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("student2@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-submit").click();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("student2@ucsb.edu");

    // DELETE
    page.getByTestId("RecommendationRequestTable-cell-row-0-col-Delete-button").click();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_recommendationrequest() throws Exception {
    setupUser(false);

    page.getByText("Recommendation Requests").click();
    assertThat(page.getByText("Create Recommendation Request")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .not().isVisible();
  }
}
