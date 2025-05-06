package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {
    @Test
    public void admin_user_can_create_edit_delete_menuitemreview() throws Exception {
        setupUser(true);

        page.getByText("Menu Item Reviews").click();

        page.getByText("Create Review").click();
        assertThat(page.getByText("Create New Menu Item Review")).isVisible();
        page.getByLabel("Item Id").fill("7");
        page.getByLabel("Reviewer Email").fill("simonryan@ucsb.edu");
        page.getByLabel("Stars").fill("5");
        page.getByLabel("Comments").fill("Amazing");
        page.getByLabel("Date (iso format)").fill("2022-01-03T00:00");
        page.getByTestId("MenuItemReviewForm-submit").click();

        assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-itemId"))
                .hasText("7");

        page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button").click();
        assertThat(page.getByText("Edit Review")).isVisible();
        page.getByLabel("Comments").fill("Terrible");
        page.getByText("Update").click();

        assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).hasText("Terrible");

        page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-name")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_menuitemreview() throws Exception {
        setupUser(false);

        page.getByText("Menu Item Reviews").click();

        assertThat(page.getByText("Create Review")).not().isVisible();
        assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-name")).not().isVisible();
    }
}
