import React, { useState } from "react";
import {
  Button,
  Container,
  TextareaAutosize,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./App.css";
import logo from "./logo.png";
function App() {
  const [foodPreference, setFoodPreference] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://us-central1-travelfoodie-prompter-7fc1f.cloudfunctions.net/search?query=${foodPreference}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <img src={logo} alt="Logo" className="logo" />
        <Box mt={4}>
          <TextareaAutosize
            rowsMin={4}
            style={{ width: "300px" }}
            placeholder="Enter your food preferences"
            value={foodPreference}
            onChange={(e) => setFoodPreference(e.target.value)}
          />
        </Box>
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>
        </Box>
        {searchResults.length > 0 && searchResults[0].score >= 0.75 && (
          <>
            <Box mt={4} width="100%">
              <Typography variant="h6" gutterBottom>
                Top 3 travel destinations you may like:
              </Typography>
              {searchResults.map((result, index) => (
                <Accordion key={index}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                  >
                    <Typography>{result.country}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{result.text}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </>
        )}
        {searchResults.length > 0 && searchResults[0].score < 0.75 && (
          <Box mt={4} width="100%">
            <Typography variant="h6" gutterBottom>
              We can't confidently recommend any travel destinations based on
              your search request
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
