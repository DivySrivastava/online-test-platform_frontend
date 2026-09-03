import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManageTests = () => {
  // Sample tile data (you can fetch this from backend later)
  const navigate = useNavigate();
  const tiles = [
    { id: 1, title: 'Create Tests', description: 'Create and Publish New Tests' },
    { id: 2, title: 'Test Details', description: 'Details of Existing Tests'},
    { id: 3, title: 'Tile 3', description: 'This is tile three' },
    { id: 4, title: 'Tile 4', description: 'This is tile four' },
  ];

   const handleTileClick = (title,id) => {
        if(id === 1){
          navigate(`/createquiz`);
        }

        if(id === 2){
          navigate(`/managequiz`);
        }

    //navigate(`/${title}/${id}`);
  };


  return (
   <div style={styles.container}>
      {tiles.map((tile) => (
        <div
          key={tile.id}
          style={styles.tile}
          onClick={() => handleTileClick(tile.title,tile.id)}
        >
          <h3>{tile.title}</h3>
          <p>{tile.description}</p>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  tile: {
    background: '#f0f0f0',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
};

export default ManageTests;
