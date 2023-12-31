import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import _ from "lodash";
import Slider from "react-slider";
import Logo from "./assets/logo.png";

interface IBody {
  id: string;
  name: string;
  isPlanet: boolean;
  gravity: number;
}

interface OptionType {
  value: string;
  label: string;
}

function App() {
  const [bodies, setBodies] = useState<IBody[]>([]);
  const [selectedBody, setSelectedBody] = useState<IBody | null>(null);
  const { register, watch, setValue } = useForm<{
    isPlanet: boolean;
    gravity: number;
  }>({
    defaultValues: {
      isPlanet: false,
      gravity: 0,
    },
  });
  const isPlanet = watch("isPlanet");
  const gravity = watch("gravity");

  useEffect(() => {
    const debouncedFetchBodies = _.debounce(
      async (gravityValue: number, isPlanetChecked: boolean) => {
        try {
          const tolerance = 1;
          const apiUrl = new URL(
            "https://api.le-systeme-solaire.net/rest.php/bodies"
          );
          const params = new URLSearchParams();
          params.append("data", "id,name,isPlanet,gravity");
          params.append("order", "gravity,desc");

          params.append("filter[]", `isPlanet,eq,${isPlanetChecked}`);
          params.append(
            "filter[]",
            `gravity,bt,${gravityValue - tolerance},${gravityValue + tolerance}`
          );
          apiUrl.search = params.toString();

          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log(data);
          setBodies(data.bodies);
        } catch (error) {
          console.error("Error fetching the solar system bodies:", error);
        }
      },
      300
    );

    debouncedFetchBodies(gravity, isPlanet);

    return () => {
      debouncedFetchBodies.cancel();
    };
  }, [gravity, isPlanet]);

  const bodyOptions: OptionType[] = bodies.map((body) => ({
    value: body.id,
    label: body.name,
  }));

  // Handler for when a new body is selected
  const handleSelectChange = (selectedOption: OptionType | null) => {
    if (selectedOption) {
      const body = bodies.find((b) => b.id === selectedOption.value);
      setSelectedBody(body || null);
    }
  };

  return (
    <>
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <form className="p-8 w-full max-w-md bg-white rounded-xl shadow-lg">
          <div className="flex items-center mb-6 justify-center">
            <img src={Logo} alt="Rhobs Logo" width={110} />
            <h3 className="text-2xl mt-[3px] font-[700] uppercase text-[#1D3C70] ">
              Challenge
            </h3>
          </div>
          <div className="flex flex-col gap-6">
            <label className="flex items-center">
              <input
                {...register("isPlanet")}
                type="checkbox"
                className="h-4 w-4 text-[#EC7D05]"
              />
              <span className="ml-2 font-semibold text-lg text-[#1D3C70]">
                Is Planet
              </span>
            </label>
            <div className="flex items-center gap-2">
              <Slider
                step={0.1}
                min={0}
                max={24}
                onChange={(value: number) => {
                  setValue("gravity", value);
                }}
                className="w-full h-3  rounded-md flex items-center cursor-pointer"
                thumbClassName="h-6 w-6 bg-[#EC7D05] rounded-full cursor-pointer"
                trackClassName="h-3 bg-[#1D3C70] rounded-md"
              />
              <span className="w-36 text-center text-lg font-semibold">
                <span className="text-[#1D3C70]">Gravity:</span>{" "}
                <span className="text-[#EC7D05]">{gravity}</span>
              </span>
            </div>
            <div>
              <label
                htmlFor="bodies"
                className="block mb-2 text-[#1D3C70] text-lg font-semibold"
              >
                Bodies:
              </label>
              <Select
                options={bodyOptions}
                onChange={handleSelectChange}
                className="text-black"
              />
            </div>
            <div>
              <textarea
                id="infoBody"
                name="infoBody"
                className="w-full h-32 p-2 border border-gray-300 rounded"
                placeholder="Info on the body"
                readOnly
                value={
                  selectedBody
                    ? `Name: ${selectedBody.name}\nGravity: ${selectedBody.gravity}\nIs Planet: ${selectedBody.isPlanet}`
                    : ""
                }
              />
            </div>
          </div>
        </form>
      </div>
      <footer className="fixed bottom-0 text-[#EC7D05] bg-[#1D3C70] w-full text-center text-2xl py-2">
        Made by Ammari Abdelmounaim for RHOBS Intership
      </footer>
    </>
  );
}

export default App;
