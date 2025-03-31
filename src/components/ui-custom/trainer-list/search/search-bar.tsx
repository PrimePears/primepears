"use client";

import type React from "react";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 mt-4">
      <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto mb-2">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              className="pl-10 h-10 w-full"
            />
          </div>
          <Button
            type="submit"
            className="bg-custom-button-green hover:bg-custom-button-hover-green text-white h-10 px-4 sm:px-6 whitespace-nowrap"
          >
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}
