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
public class ArticlesWebIT extends WebTestCase {
    @Test
    public void admin_user_can_create_edit_delete_articles() throws Exception {
        setupUser(true);

        page.getByText("Articles").click();

        page.getByText("Create Articles").click();
        assertThat(page.getByText("Create New Articles")).isVisible();
        page.getByLabel("title").fill("Using testing-playground with React Testing Library");
        page.getByLabel("url").fill("https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7");
        page.getByLabel("explanation").fill("Helpful when we get to front end development");
        page.getByLabel("email").fill("phtcon@ucsb.edu");
        page.getByLabel("Date Added (iso format)").fill("2022-04-20T00:00");
        page.getByTestId("ArticlesForm-submit").click();

        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title"))
                .hasText("Using testing-playground with React Testing Library");

        page.getByTestId("ArticlesTable-cell-row-0-col-Edit-button").click();
        assertThat(page.getByText("Edit Articles")).isVisible();
        page.getByLabel("title").fill("Testing Using testing-playground with React Testing Library");
        page.getByText("Update").click();

        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-title")).hasText("Testing Using testing-playground with React Testing Library");

        page.getByTestId("ArticlesTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-name")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_articles() throws Exception {
        setupUser(false);

        page.getByText("Articles").click();

        assertThat(page.getByText("Create Articles")).not().isVisible();
        assertThat(page.getByTestId("ArticlesTable-cell-row-0-col-name")).not().isVisible();
    }
}