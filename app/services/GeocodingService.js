import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const getName = async (lng, lat) => {
    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        const address = data.features?.[0]?.place_name || "Unknown location";

        // console.log("Location Address:", address);
        return address; // ✅ Return the address for further use
    } catch (error) {
        console.error("Failed to fetch address:", error);
        return "Unknown location"; // ✅ Return a fallback value in case of error
    }
};

export {getName};