/**
 * 3D Dendrogram visualization component for displaying note connections
 */
import React, { useRef, useEffect, useState } from 'react';
import { Note } from '../types';
import ForceGraph3D from 'react-force-graph-3d';



interface DendrogramViewProps {
  notes: Note[];
  darkMode: boolean;
  onNoteSelect?: (noteId: string) => void;
}

import { notesToGraphData, GraphData } from '../utils/graphUtils';
import { createNodeObject } from '../utils/nodeUtils';

const DendrogramView: React.FC<DendrogramViewProps> = ({ notes, darkMode, onNoteSelect }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const fgRef = useRef<any>();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Resize observer for container
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
        
        if (fgRef.current && isVisible) {
          // Update renderer size
          const renderer = fgRef.current.renderer();
          renderer.setSize(width, height);
          
          // Update camera
          const camera = fgRef.current.camera();
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      }
    });
  
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [isVisible]);

  // Merge new graph data incrementally (only when visible)
  useEffect(() => {
    if (!notes || notes.length === 0 || !isVisible) return;
    
    const newGraphData = notesToGraphData(notes);
    setGraphData(prev => ({
      nodes: [
        ...prev.nodes.filter(pn => 
          newGraphData.nodes.some(ngn => ngn.id === pn.id)
        ),
        ...newGraphData.nodes.filter(ngn => 
          !prev.nodes.some(pn => pn.id === ngn.id)
        )
      ],
      links: [
        ...prev.links.filter(pl => 
          newGraphData.links.some(ngl => 
            ngl.source === pl.source && ngl.target === pl.target
          )
        ),
        ...newGraphData.links.filter(ngl => 
          !prev.links.some(pl => 
            pl.source === ngl.source && pl.target === ngl.target
          )
        )
      ]
    }));
  }, [notes, isVisible]);
  
  // Handle window resize (only when visible)
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      if (fgRef.current && isVisible) {
        fgRef.current.d3Force('charge').strength(-120);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial dimensions
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);



  // Custom node object using utility function
  const nodeThreeObject = (node: GraphNode) => createNodeObject(node, darkMode);

  return (
    <div className="w-full h-full" ref={containerRef} style={{ 
      minHeight: '500px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {(!notes || notes.length === 0 || !isVisible) ? (
        <div className="flex items-center justify-center h-full">
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No notes to visualize. Create some notes with links to see connections.
          </p>
        </div>
      ) : (
        <>

        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          nodeThreeObject={(node) => createNodeObject(node, darkMode, hoveredNode === node.id)}
          onNodeHover={node => setHoveredNode(node?.id || null)}
          nodeLabel={(node: GraphNode) => node.name}
          linkWidth={2}
          linkDirectionalParticles={link => link.bidirectional ? 0 : 6}
          linkDirectionalParticleSpeed={link => link.bidirectional ? 0 : 0.005}
          linkDirectionalParticleWidth={1.5}
          linkColor={link => darkMode ?
            (link.bidirectional ? '#ffffff' : '#cccccc') : 
            (link.bidirectional ? '#000000' : '#666666')}
          linkDirectionalArrowLength={0}
          backgroundColor={darkMode ? '#111827' : '#f9fafb'}
          onNodeClick={(node: GraphNode) => {
            if (onNoteSelect) {
              onNoteSelect(node.id);
            }
            const element = document.getElementById(`note-${node.id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          controlType="orbit"
          enableNodeDrag={true}
          enableNavigationControls={true}
        />
      </>
      )}
    </div>
  );
};

export default DendrogramView;