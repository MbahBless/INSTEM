import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Internship } from "../types";
import { MapPin, Building2, Briefcase, DollarSign, X, SlidersHorizontal, Eye } from "lucide-react";

interface InternshipMapProps {
  internships: Internship[];
  onSelectLocation: (location: string | null) => void;
  selectedLocation: string | null;
}

interface Geonode {
  id: string;
  name: string;
  region: string;
  state: string;
  x: number; // Percent width coordinate (0-100)
  y: number; // Percent height coordinate (0-100)
  keywords: string[];
}

export default function InternshipMap({ internships, onSelectLocation, selectedLocation }: InternshipMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });
  const [clickedNode, setClickedNode] = useState<Geonode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Geonode | null>(null);

  // Core geographical nodes in US corresponding to tech hubs / placement markets
  const hubs: Geonode[] = [
    { id: "sf", name: "San Francisco", region: "West Coast", state: "CA", x: 15, y: 52, keywords: ["san francisco", "ca", "california", "bay area"] },
    { id: "seattle", name: "Seattle", region: "Pacific NW", state: "WA", x: 15, y: 22, keywords: ["seattle", "wa", "washington", "northwest"] },
    { id: "ny", name: "New York", region: "East Coast", state: "NY", x: 85, y: 38, keywords: ["new york", "ny", "east coast", "manhattan"] },
    { id: "austin", name: "Austin", region: "South", state: "TX", x: 50, y: 82, keywords: ["austin", "tx", "texas", "houston", "dallas"] },
    { id: "chicago", name: "Chicago", region: "Midwest", state: "IL", x: 65, y: 44, keywords: ["chicago", "il", "illinois", "midwest"] },
    { id: "boston", name: "Boston", region: "New England", state: "MA", x: 89, y: 32, keywords: ["boston", "ma", "massachusetts"] },
    { id: "denver", name: "Denver", region: "Mountain", state: "CO", x: 38, y: 55, keywords: ["denver", "co", "colorado"] },
  ];

  // Helper to count active internships for a geonode hub
  const getJobsForHub = (hub: Geonode) => {
    return internships.filter((job) => {
      const loc = job.location.toLowerCase();
      return hub.keywords.some((keyword) => loc.includes(keyword));
    });
  };

  // Helper to count Remote positions separately
  const remoteJobs = internships.filter(job => job.location.toLowerCase().includes("remote") || job.type?.toLowerCase() === "remote");

  // Track resizing of container correctly
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // Keep standard aspect ratio of US Map projection width:height ~ 1.7
        const newWidth = Math.max(320, width);
        const newHeight = Math.min(420, newWidth * 0.58);
        setDimensions({ width: newWidth, height: newHeight });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Main D3 Drawing logic
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous layouts

    const { width, height } = dimensions;

    // Create background grid or outline using D3 lines
    // Draw secondary abstract grid lines to reinforce technical visual identity
    const gridG = svg.append("g").attr("class", "grid-axis-lines").style("opacity", "0.2");
    
    // Horizontal tracking lines
    for (let i = 1; i < 5; i++) {
      const yPos = (height / 5) * i;
      gridG.append("line")
        .attr("x1", 0)
        .attr("y1", yPos)
        .attr("x2", width)
        .attr("y2", yPos)
        .attr("stroke", "#404040")
        .attr("stroke-dasharray", "3,6")
        .attr("stroke-width", 0.5);
    }
    // Vertical tracking lines
    for (let i = 1; i < 8; i++) {
      const xPos = (width / 8) * i;
      gridG.append("line")
        .attr("x1", xPos)
        .attr("y1", 0)
        .attr("x2", xPos)
        .attr("y2", height)
        .attr("stroke", "#404040")
        .attr("stroke-dasharray", "3,6")
        .attr("stroke-width", 0.5);
    }

    // DRAW ABSTRACT SCHEMATION USA SHAPE
    // Approximate polygonal coordinates for regional borders
    const borders = [
      { name: "West", points: [[5, 10], [30, 10], [45, 30], [35, 75], [5, 60]] },
      { name: "Midwest-South", points: [[35, 75], [45, 30], [70, 25], [75, 55], [60, 95], [42, 90]] },
      { name: "East", points: [[70, 25], [92, 20], [95, 55], [75, 55]] }
    ];

    const borderGroup = svg.append("g").attr("class", "usa-boundaries");
    
    borders.forEach(b => {
      const pxPoints = b.points.map(pt => [ (pt[0] / 100) * width, (pt[1] / 100) * height ]);
      const lineGen = d3.line();
      
      borderGroup.append("path")
        .attr("d", lineGen(pxPoints as [number, number][]) + "Z")
        .attr("fill", "#0a0a0a")
        .attr("stroke", "#1e1e1e")
        .attr("stroke-width", 1.5)
        .attr("class", "transition-all")
        .style("opacity", "0.4")
        .on("mouseover", function() {
          d3.select(this).attr("fill", "#0f0f0f").attr("stroke", "#262626");
        })
        .on("mouseout", function() {
          d3.select(this).attr("fill", "#0a0a0a").attr("stroke", "#1e1e1e");
        });
    });

    // Draw tech transit lines connecting nodes (fiber schema feel)
    const routes = [
      ["sf", "seattle"],
      ["sf", "austin"],
      ["sf", "chicago"],
      ["seattle", "denver"],
      ["denver", "chicago"],
      ["austin", "chicago"],
      ["chicago", "ny"],
      ["ny", "boston"],
      ["austin", "ny"]
    ];

    const pipelineG = svg.append("g").attr("class", "tech-pipelines");
    
    routes.forEach(([srcId, dstId]) => {
      const src = hubs.find(h => h.id === srcId);
      const dst = hubs.find(h => h.id === dstId);
      if (src && dst) {
        const x1 = (src.x / 100) * width;
        const y1 = (src.y / 100) * height;
        const x2 = (dst.x / 100) * width;
        const y2 = (dst.y / 100) * height;

        pipelineG.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", "#262626")
          .attr("stroke-width", 0.8)
          .attr("stroke-dasharray", "4,4")
          .style("opacity", "0.75");
      }
    });

    // DRAW INTUITIVE INTERACTIVE HUBS (PINS & GLOW RING D3 SCALE)
    const hubGroup = svg.append("g").attr("class", "geographic-pins");

    // Establish scale for points depending on active jobs counts
    const maxJobs = Math.max(1, ...hubs.map(h => getJobsForHub(h).length));
    
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxJobs])
      .range([6, 15]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(hubs.map(h => h.id))
      .range(hubs.map(() => "#eab308")); // Yellow-500 branding theme

    hubs.forEach((hub) => {
      const cx = (hub.x / 100) * width;
      const cy = (hub.y / 100) * height;
      const matchingJobs = getJobsForHub(hub);
      const jobCount = matchingJobs.length;
      const radius = radiusScale(jobCount);
      const isSelected = selectedLocation !== null && hub.keywords.some(k => selectedLocation.toLowerCase().includes(k));

      // 1. Pulsing ring for highly active locations
      if (jobCount > 0) {
        const pulseCircle = hubGroup.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", radius + 6)
          .attr("fill", "transparent")
          .attr("stroke", isSelected ? "#f59e0b" : "#eab308")
          .attr("stroke-width", 1)
          .style("opacity", "0.25")
          .style("pointer-events", "none");

        // Simple pulsing animation loop using recursive transitions
        const pulse = () => {
          pulseCircle
            .transition()
            .duration(2000)
            .attr("r", radius + 15)
            .style("opacity", "0")
            .transition()
            .duration(0)
            .attr("r", radius + 4)
            .style("opacity", "0.35")
            .on("end", pulse);
        };
        pulse();
      }

      // 2. Base tech node circle
      const baseNode = hubGroup.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", radius)
        .attr("fill", isSelected ? "#eab308" : "#171717")
        .attr("stroke", isSelected ? "#ffffff" : jobCount > 0 ? "#eab308" : "#404040")
        .attr("stroke-width", isSelected ? 2 : 1.5)
        .attr("class", "cursor-pointer transition-all")
        .style("filter", jobCount > 0 ? "drop-shadow(0px 0px 4px rgba(234, 179, 8, 0.45))" : "none")
        .on("mouseover", (event) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(150)
            .attr("r", radius + 3)
            .attr("fill", "#eab308");
          setHoveredNode(hub);
        })
        .on("mouseout", (event) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(150)
            .attr("r", radius)
            .attr("fill", isSelected ? "#eab308" : "#171717");
          setHoveredNode(null);
        })
        .on("click", () => {
          setClickedNode(hub);
          if (isSelected) {
            onSelectLocation(null);
          } else {
            // Pick a matching location keyword to feed key searches or exact filtered lists
            onSelectLocation(hub.name + ", " + hub.state);
          }
        });

      // 3. Counter numerical label within node badge if big enough
      if (jobCount > 0 && radius >= 10) {
        hubGroup.append("text")
          .attr("x", cx)
          .attr("y", cy + 3.5)
          .attr("text-anchor", "middle")
          .attr("font-size", "9px")
          .attr("font-family", "monospace")
          .attr("font-weight", "bold")
          .attr("fill", isSelected ? "#000000" : "#ffffff")
          .style("pointer-events", "none")
          .text(jobCount);
      }

      // 4. City Name Tag Text below/above node
      const labelOffset = cy > height * 0.7 ? -14 : radius + 11;
      hubGroup.append("text")
        .attr("x", cx)
        .attr("y", cy + labelOffset)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("font-family", "monospace")
        .attr("fill", isSelected ? "#f59e0b" : jobCount > 0 ? "#e5e5e5" : "#737373")
        .attr("font-weight", isSelected || jobCount > 0 ? "600" : "400")
        .style("pointer-events", "none")
        .text(`${hub.name} (${jobCount})`);
    });

  }, [dimensions, internships, selectedLocation]);

  return (
    <div className="p-5 bg-neutral-950 border border-neutral-900 rounded-lg text-left shadow-xl flex flex-col gap-5">
      
      {/* Map header dashboard metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 rounded bg-yellow-500/10 text-yellow-500 font-mono text-[9px] font-bold uppercase tracking-widest border border-yellow-500/20">
              Interactive D3 Visualizer
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">NORTH AMERICA SYSTEM MAP</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1">Geographic Opportunities Matrix</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Displaying open internships grouped by regional offices and coordinates. Click highlighted nodes on the map to filter opportunities below.
          </p>
        </div>

        {/* Selected Hub Filter badge status */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {selectedLocation ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location: {selectedLocation}</span>
              <button 
                onClick={() => onSelectLocation(null)}
                className="hover:text-white p-0.5"
                title="Clear region filter"
              >
                <X className="w-3 h-3 ml-1" />
              </button>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-neutral-600" />
              <span>Showing All Tech Hubs</span>
            </div>
          )}

          {/* Floating Remote Jobs pill */}
          <button
            onClick={() => {
              if (selectedLocation === "Remote") {
                onSelectLocation(null);
              } else {
                onSelectLocation("Remote");
              }
            }}
            className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedLocation === "Remote"
                ? "bg-yellow-500 text-black font-semibold border-yellow-400"
                : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${selectedLocation === "Remote" ? "bg-black animate-ping" : "bg-yellow-500 animate-pulse"}`} />
            <span>Remote Portal Opportunities ({remoteJobs.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Middle: SVG D3 canvas map vector container */}
        <div ref={containerRef} className="lg:col-span-8 bg-neutral-990 rounded-lg p-2 border border-neutral-900/60 relative overflow-hidden flex items-center justify-center min-h-[260px] cursor-crosshair">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="block text-white"
            style={{ width: "100%", height: "auto" }}
          />

          {/* In-canvas beautiful hover tooltip details */}
          {hoveredNode && (
            <div className="absolute top-3 left-3 bg-neutral-950 border border-neutral-800 rounded p-2.5 shadow-xl max-w-xs font-sans text-left text-[11px] space-y-1 z-20 animate-fadeIn pointer-events-none">
              <p className="font-bold text-white flex items-center gap-1">
                <MapPin className="w-3 h-3 text-yellow-500" />
                {hoveredNode.name}, {hoveredNode.state}
              </p>
              <p className="text-[10px] font-mono text-neutral-500 uppercase">{hoveredNode.region} CLUSTER</p>
              <div className="border-t border-neutral-900 my-1.5 pt-1.5 flex justify-between gap-5 text-neutral-300 text-[10px]">
                <span>Active Openings:</span>
                <span className="font-bold text-yellow-500 font-mono">{getJobsForHub(hoveredNode).length} roles</span>
              </div>
            </div>
          )}

          {/* Map Compass/Scale indicators to make it feel extremely sophisticated */}
          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-neutral-600 bg-neutral-950/60 p-2 rounded border border-neutral-900 space-y-0.5 pointer-events-none select-none">
            <p>COMPASS: 41.8781° N, 87.6298° W</p>
            <p className="text-[8px] text-neutral-700">SCALE: SV_D3_1.0_PROJECTION</p>
          </div>
        </div>

        {/* Right: Selected place details list or locations stats summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4.5 bg-black border border-neutral-900 rounded-lg select-none space-y-3.5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-450 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-neutral-500" />
              Regional Census Summary
            </h3>

            {/* List and ranks of hubs */}
            <div className="space-y-2 divide-y divide-neutral-900/40">
              {hubs.map(hub => {
                const count = getJobsForHub(hub).length;
                const isCurrent = selectedLocation !== null && hub.keywords.some(k => selectedLocation.toLowerCase().includes(k));
                return (
                  <button
                    key={hub.id}
                    onClick={() => {
                      if (isCurrent) {
                        onSelectLocation(null);
                      } else {
                        onSelectLocation(hub.name + ", " + hub.state);
                      }
                    }}
                    className={`w-full text-left py-2.5 px-2 rounded-md transition-colors flex items-center justify-between text-xs cursor-pointer ${
                      isCurrent 
                        ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold" 
                        : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 ${isCurrent ? "text-yellow-500" : count > 0 ? "text-neutral-500" : "text-neutral-700"}`} />
                      <span>{hub.name}, {hub.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">{hub.region}</span>
                      <span className="font-mono bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-neutral-900 text-[11px] leading-relaxed text-neutral-500">
              <span>ProTip: Filter locations to immediately adjust the internship search indices below.</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
