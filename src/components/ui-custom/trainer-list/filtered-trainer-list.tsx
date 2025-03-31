"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Certification, Profile } from "@/lib/data/data";
import TrainerList from "./trainer-list";
import PaginationControls from "../trainer-list/pagination/pagination-controls";
import SearchBar from "../trainer-list/search/search-bar";

interface FilteredTrainerListProps {
  trainers: Profile[];
  certifications: Certification[];
}

export default function FilteredTrainerList({
  trainers,
  certifications,
}: FilteredTrainerListProps) {
  const searchParams = useSearchParams();
  const specialtyParam = searchParams.get("specialty");

  const [filteredTrainers, setFilteredTrainers] = useState(trainers);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState(specialtyParam || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of trainers per page

  // Reset to first page when search query or specialty changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, specialty]);

  // Update specialty when URL parameter changes
  useEffect(() => {
    if (specialtyParam) {
      setSpecialty(specialtyParam);
    }
  }, [specialtyParam]);

  // Filter trainers based on search query and specialty
  useEffect(() => {
    let filtered = trainers;

    // Filter by specialty if specified
    if (specialty) {
      filtered = filtered.filter(
        (trainer) =>
          trainer.trainerType?.toLowerCase() === specialty.toLowerCase()
      );
    }

    // Filter by search query if specified
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((trainer) => {
        // Search by name
        if (trainer.name.toLowerCase().includes(query)) {
          return true;
        }

        // Search by location
        if (trainer.location.toLowerCase().includes(query)) {
          return true;
        }

        // Search by specialty
        if (trainer.trainerType?.toLowerCase().includes(query)) {
          return true;
        }

        // Search by certification
        const trainerCertifications = certifications.filter(
          (cert) => cert.userId === trainer.id
        );

        return trainerCertifications.some((cert) =>
          cert.name.toLowerCase().includes(query)
        );
      });
    }

    setFilteredTrainers(filtered);
  }, [searchQuery, specialty, trainers, certifications]);

  // Calculate pagination values
  const totalItems = filteredTrainers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTrainers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of trainer list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} />

      {specialty && (
        <div className="border p-2 bg-muted rounded-md">
          <p className="text-sm">
            Filtering by specialty:{" "}
            <span className="font-medium capitalize">{specialty}</span>
            <button
              onClick={() => setSpecialty("")}
              className="ml-2 text-primary hover:underline"
            >
              Clear filter
            </button>
          </p>
        </div>
      )}

      {/* Pagination info */}
      {filteredTrainers.length > 0 ? (
        <div className="text-center text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}{" "}
          of {totalItems} trainers
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No trainers found matching your criteria
          </p>
        </div>
      )}

      <TrainerList trainers={currentItems} certificationProp={certifications} />

      {/* Only show pagination if we have trainers */}
      {filteredTrainers.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
