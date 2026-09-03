import React from "react";
import { Link } from "react-router-dom";
import "./Tiles.css"; // Import CSS file

const Tiles = ({per}) => {
    const tileData = [
        { id: 1, title: "Manage Users", description: "For Managing Users", pagename: "manageuser" },
        { id: 2, title: "Manage Tests", description: "For Quiz Creation", pagename: "managetests"},
        { id: 3, title: "Take Quiz", description: "For giving tests", pagename: "takequiz" },
        { id: 4, title: "Tests Status", description: "For showing test status", pagename: "teststatus" },
        { id: 5, title: "Past Tests", description: "For Viewing Past Tests", pagename: "pasttest" },
        // { id: 6, title: "Tile 6", description: "This is tile 6", pagename: "desc" },
        { id: 6, title: "Manage Students", description: "For Managing Users", pagename: "managestudents" },
    ];

    
    return (
        <div className="tile-container">        
            {tileData
                .filter((tile) => per.includes(tile.id))
                .map((tile) => (
                    <Link to={`/${tile.pagename}`} key={tile.id} className="tile">
                    <h2>{tile.title}</h2>
                    <p>{tile.description}</p>
                    </Link>
                ))}
        </div>  
    );
};

export default Tiles;
