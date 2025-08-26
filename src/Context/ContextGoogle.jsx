/* eslint-disable no-unused-vars */
import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Papa from "papaparse";

const Context = createContext();

// Function to determine correct path based on current location
const getCitiesCsvPath = () => {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/dist')) {
    // We're in dist context, need to go up more levels
    return '../../team/projects/map/cities.csv';
  } else if (currentPath.includes('/feed')) {
    // We're in feed folder
    return '../team/projects/map/cities.csv';
  } else {
    // Direct access from webroot
    return 'team/projects/map/cities.csv';
  }
};

export default function ContextProvider({ children }) {
  const [mediaList, setMediaList] = useState([]);
  const [currentMedia, setCurrentMedia] = useState(null);

  //I am creating a sample feedlist state to fetch the data
  // const [feedlist, setFeedlist] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      console.log("🔄 ContextGoogle: Starting to fetch media data...");
      try {
        // Pulls from this main Google Sheet to get a list of feeds for our dropdown menu: 
        // https://docs.google.com/spreadsheets/d/1jQTlXWom-pXvyP9zuTcbdluyvpb43hu2h7anxhF5qlQ/edit?usp=sharing
        // Add comments in the sheet above to request additions.
        const response = await axios.get(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vSxfv7lxikjrmro3EJYGE_134vm5HdDszZKt4uKswHhsNJ_-afSaG9RoA4oeNV656r4mTuG3wTu38pM/pub?output=csv"
        );
        //This link i am using to get the feed list form the google spread sheet
        const sampleResponse = await axios.get(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vSxfv7lxikjrmro3EJYGE_134vm5HdDszZKt4uKswHhsNJ_-afSaG9RoA4oeNV656r4mTuG3wTu38pM/pub?gid=889452679&single=true&output=csv"
        );
        console.log("✅ ContextGoogle: Successfully fetched CSV data");
        
        Papa.parse(sampleResponse.data, {
          header: true, // Assuming your CSV has headers
          complete: (results) => {
            console.log("🔍 ContextGoogle: Parsing CSV results:", results.data.length, "rows");
            const feedMedia = results.data
              .filter((row) => row.Text === "TRUE")
              .map((row) => ({
                feed: row.List,
                title: row.Title,
                text: row.Text,
                description: row.Description,
                url: row.URL,
                feedFields: row.FeedFields,
              }));
            console.log("✅ ContextGoogle: Processed media list:", feedMedia.length, "items");
            console.log("📊 ContextGoogle: Media titles:", feedMedia.map(m => m.title));
            setMediaList(feedMedia);
            
            // Set first media as current if none selected
            if (feedMedia.length > 0) {
              console.log("🎯 ContextGoogle: Setting first media as current:", feedMedia[0].title);
              setCurrentMedia(feedMedia[0]);
            }
          },
        });
      } catch (error) {
        console.error("❌ ContextGoogle: Error fetching Google Sheets data:", error);
        console.log("🔄 ContextGoogle: Attempting to load local cities.csv fallback...");
        
        // Fallback to local cities.csv
        try {
          const citiesCsvPath = getCitiesCsvPath();
          console.log("📍 ContextGoogle: Loading cities CSV from:", citiesCsvPath);
          
          const citiesResponse = await axios.get(citiesCsvPath);
          console.log("✅ ContextGoogle: Successfully fetched cities.csv fallback");
          
          Papa.parse(citiesResponse.data, {
            header: true,
            complete: (results) => {
              console.log("🔍 ContextGoogle: Parsing cities CSV results:", results.data.length, "rows");
              
              // Create a single 'Cities' feed entry for the dropdown
              // Individual cities will be loaded as scenes when this feed is selected
              const citiesMedia = [{
                feed: "cities",
                title: "Cities", 
                text: "TRUE",
                description: "Georgia cities with population and location data",
                url: '', // Will be populated by FeedPlayer when selected
                feedFields: 'City,County,FIPS,Population,Latitude,Longitude'
              }];
              
              console.log("✅ ContextGoogle: Processed cities fallback:", citiesMedia.length, "items");
              console.log("🏙️ ContextGoogle: City names:", citiesMedia.map(m => m.title));
              
              setMediaList(citiesMedia);
              
              // Set first city as current if none selected
              if (citiesMedia.length > 0) {
                console.log("🎯 ContextGoogle: Setting first city as current:", citiesMedia[0].title);
                setCurrentMedia(citiesMedia[0]);
              }
            },
            error: (parseError) => {
              console.error("❌ ContextGoogle: Error parsing cities CSV:", parseError);
              // Set empty state if even fallback fails
              setMediaList([]);
              setCurrentMedia(null);
            }
          });
        } catch (fallbackError) {
          console.error("❌ ContextGoogle: Cities.csv fallback also failed:", fallbackError);
          console.log("⚠️ ContextGoogle: No media data available - setting empty state");
          setMediaList([]);
          setCurrentMedia(null);
        }
      }
    };

    fetchMedia();
  }, []); // Empty dependency array - only run once on mount

  return (
    <Context.Provider
      value={{
        mediaList,
        setMediaList,
        currentMedia,
        setCurrentMedia,
      }}
    >
      {children}
    </Context.Provider>
  );
}

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { Context };
