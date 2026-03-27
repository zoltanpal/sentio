import { ClearableInput } from "@/components/ui/cleareable-input";
import { useState } from "react";
import Loading from "@/components/elements/Loading";
import { SearchIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";


const sentimentLabelMap: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mostly_positive: "Mostly Positive",
  mostly_negative: "Mostly Negative",
  mixed: "Mixed",
};



export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [windowRangeValue, setWindowRangeValue] = useState<number[]>([6]);
  const [error, setError] = useState("");


    const onSearch = async () => {};



  return (
    <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold">
            What is the news saying right now?
        </h1>
        <h4 className="text-lg text-gray-600">
            Search any topic and instantly see the tone of recent news coverage.
        </h4>
        <div className="mt-4">

        </div>
        <div className="mt-6">
            <label>Waiting for the good stuff ...</label>
        </div>


    </div>
    );
}