/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Upload, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useS3Upload } from "next-s3-upload";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

export default function Page() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<
    { language: string; description: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { uploadToS3 } = useS3Upload();

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const { url } = await uploadToS3(file);
    console.log("Successfully uploaded to S3!", url);
    setImage(url);
  };

  const handleLanguageSelect = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else if (selectedLanguages.length < 3) {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSubmit = async () => {
    if (!image || selectedLanguages.length === 0) return;

    setIsLoading(true);

    const response = await fetch("/api/generateDescriptions", {
      method: "POST",
      body: JSON.stringify({
        languages: selectedLanguages,
        imageUrl: image,
      }),
    });

    const descriptions = await response.json();
    console.log(descriptions);

    setDescriptions(descriptions);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-xl mx-auto mt-20 p-6">
      <h2 className="text-2xl font-bold text-center mb-1">
        Product Description Generator
      </h2>
      <p className="text-sm text-gray-500 text-center mb-6 text-balance">
        Upload an image of your product to generate descriptions in multiple
        languages.
      </p>
      <div>
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors aspect-video m-12">
          {image ? (
            <div className="relative">
              <img
                src={image}
                alt="Uploaded product"
                className="max-h-64 rounded"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0"
                onClick={() => setImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 mb-2" />
                <span>Upload product image</span>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Label>
          )}
        </div>
        <div className="text-left mt-10">
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedLanguages.map((lang) => (
              <span
                key={lang}
                className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm"
              >
                {languages.find((l) => l.code === lang)?.name}
              </span>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex justify-between hover:text-blue-500 w-1/2 mt-4">
                <span>Select Languages:</span>
                <Settings />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {languages.map((lang) => (
                <DropdownMenuCheckboxItem
                  key={lang.code}
                  onSelect={(e) => e.preventDefault()}
                  checked={selectedLanguages.includes(lang.code)}
                  onCheckedChange={() => handleLanguageSelect(lang.code)}
                >
                  {lang.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-right mt-20">
          <Button
            onClick={handleSubmit}
            disabled={!image || selectedLanguages.length === 0 || isLoading}
          >
            {isLoading ? "Generating..." : "Generate Descriptions"}
          </Button>
        </div>
      </div>
      {Object.keys(descriptions).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Generated Descriptions</h3>
          {descriptions.map(({ language, description }) => (
            <div key={language}>
              <h4 className="font-medium">
                {languages.find((l) => l.code === language)?.name}
              </h4>
              <p className="mt-1">{description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}