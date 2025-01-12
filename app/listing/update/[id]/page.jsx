"use client";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { deleteFileByUrl, uploadMultipleFiles } from "@/lib/actions/uploadFile";
import { toast } from "react-toastify";
export default function UpdateListing() {
	const { isSignedIn, isLoaded, user } = useUser();
	const [files, setFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);
	const pathname = usePathname();
	const listingId = pathname.split("/").pop();
	const [formData, setFormData] = useState({
		imageUrls: [],
		name: "",
		description: "",
		address: "",
		type: "rent",
		bedrooms: 1,
		bathrooms: 1,
		regularPrice: 50,
		discountPrice: 0,
		offer: false,
		parking: false,
		furnished: false,
	});
	useEffect(() => {
		const fetchListing = async () => {
			const res = await fetch("/api/listing/get", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					listingId,
				}),
			});
			const data = await res.json();
			if (data.success === false) {
				setFormData("");
				return;
			}
			setFormData(data[0]);
		};
		fetchListing();
	}, [listingId]);

	const router = useRouter();

	const fileInputRef = useRef(null);

	const handleImageSubmit = async (e) => {
		e.preventDefault();
		setUploading(true);
		// Convert FileList to an array
		const fileArray = Array.from(files);
		if (fileArray.length < 1) {
			toast.error("Please select at least one image");
			setUploading(false);
			return;
		}

		const uploadedFiles = await uploadMultipleFiles(
			fileArray,
			"realestate",
			"upload",
		);
		if (uploadedFiles.error) {
			console.log(uploadedFiles);
			toast.error(uploadedFiles.message);
			setUploading(false);
			return;
		} else {
			setFormData((prevState) => ({
				...prevState,
				imageUrls: [...prevState.imageUrls, ...uploadedFiles],
			}));
			setUploading(false);
			fileInputRef.current.value = null;
			toast.success("uploaded successfully");
		}
	};

	const deleteFile = async (url) => {
		const res = await deleteFileByUrl(url);
		if (res.error) {
			console.log(res);
			toast.error(res.message);
			return;
		}
		setFormData((prevState) => ({
			...prevState,
			imageUrls: prevState.imageUrls.filter((imageUrl) => imageUrl !== url),
		}));
		return toast.success("Image deleted successfully");
	};

	const handleChange = (e) => {
		if (e.target.id === "sale" || e.target.id === "rent") {
			setFormData({
				...formData,
				type: e.target.id,
			});
		}
		if (
			e.target.id === "parking" ||
			e.target.id === "furnished" ||
			e.target.id === "offer"
		) {
			setFormData({
				...formData,
				[e.target.id]: e.target.checked,
			});
		}
		if (
			e.target.type === "number" ||
			e.target.type === "text" ||
			e.target.type === "textarea"
		) {
			setFormData({
				...formData,
				[e.target.id]: e.target.value,
			});
		}
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (formData.imageUrls.length < 1)
				return setError("You must upload at least one image");
			if (+formData.regularPrice < +formData.discountPrice)
				return setError("Discount price must be lower than regular price");
			setLoading(true);
			setError(false);
			const res = await fetch("/api/listing/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					userMongoId: user.publicMetadata.userMogoId,
					listingId,
				}),
			});
			const data = await res.json();
			setLoading(false);
			if (data.success === false) {
				setError(data.message);
				toast.error(data.message);
			}
			router.push(`/listing/${data._id}`);
			toast.success("Listing updated successfully");
		} catch (error) {
			setError(error.message);
			setLoading(false);
			toast.error("Error updating listing");
		}
	};
	if (!isLoaded) {
		return (
			<h1 className="text-center text-xl my-7 font-semibold">Loading...</h1>
		);
	}
	if (!isSignedIn) {
		return (
			<h1 className="text-center text-xl my-7 font-semibold">
				You are not authorized to view this page
			</h1>
		);
	}
	if (!formData) {
		return (
			<h1 className="text-center text-xl my-7 font-semibold">
				Listing not found
			</h1>
		);
	}
	return (
		<main className="p-3 max-w-4xl mx-auto">
			<h1 className="text-3xl font-semibold text-center my-7">
				Update a Listing
			</h1>
			<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
				<div className="flex flex-col gap-4 flex-1">
					<input
						type="text"
						placeholder="Name"
						className="border p-3 rounded-lg"
						id="name"
						maxLength="62"
						minLength="10"
						required
						onChange={handleChange}
						value={formData.name}
					/>
					<textarea
						type="text"
						placeholder="Description"
						className="border p-3 rounded-lg"
						id="description"
						required
						onChange={handleChange}
						value={formData.description}
					/>
					<input
						type="text"
						placeholder="Address"
						className="border p-3 rounded-lg"
						id="address"
						required
						onChange={handleChange}
						value={formData.address}
					/>
					<div className="flex gap-6 flex-wrap">
						<div className="flex gap-2">
							<input
								type="checkbox"
								id="sale"
								className="w-5"
								onChange={handleChange}
								checked={formData.type === "sale"}
							/>
							<span>Sell</span>
						</div>
						<div className="flex gap-2">
							<input
								type="checkbox"
								id="rent"
								className="w-5"
								onChange={handleChange}
								checked={formData.type === "rent"}
							/>
							<span>Rent</span>
						</div>
						<div className="flex gap-2">
							<input
								type="checkbox"
								id="parking"
								className="w-5"
								onChange={handleChange}
								checked={formData.parking}
							/>
							<span>Parking spot</span>
						</div>
						<div className="flex gap-2">
							<input
								type="checkbox"
								id="furnished"
								className="w-5"
								onChange={handleChange}
								checked={formData.furnished}
							/>
							<span>Furnished</span>
						</div>
						<div className="flex gap-2">
							<input
								type="checkbox"
								id="offer"
								className="w-5"
								onChange={handleChange}
								checked={formData.offer}
							/>
							<span>Offer</span>
						</div>
					</div>
					<div className="flex flex-wrap gap-6">
						<div className="flex items-center gap-2">
							<input
								type="number"
								id="bedrooms"
								min="1"
								max="10"
								required
								className="p-3 border border-gray-300 rounded-lg"
								onChange={handleChange}
								value={formData.bedrooms}
							/>
							<p>Beds</p>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="number"
								id="bathrooms"
								min="1"
								max="10"
								required
								className="p-3 border border-gray-300 rounded-lg"
								onChange={handleChange}
								value={formData.bathrooms}
							/>
							<p>Baths</p>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="number"
								id="regularPrice"
								required
								className="p-3 border border-gray-300 rounded-lg"
								min="50"
								max="10000000"
								onChange={handleChange}
								value={formData.regularPrice}
							/>
							<div className="flex flex-col items-center">
								<p>Regular price</p>
								<span className="text-xs">($ / month)</span>
							</div>
						</div>
						{formData.offer && (
							<div className="flex items-center gap-2">
								<input
									type="number"
									id="discountPrice"
									min="0"
									max="10000000"
									required
									className="p-3 border border-gray-300 rounded-lg"
									onChange={handleChange}
									value={formData.discountPrice}
								/>
								<div className="flex flex-col items-center">
									<p>Discounted price</p>
									<span className="text-xs">($ / month)</span>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="flex flex-col flex-1 gap-4">
					<p className="font-semibold">
						Images:
						<span className="font-normal text-gray-600 ml-2">
							The first image will be the cover (max 6)
						</span>
					</p>
					<div className="flex gap-4">
						<input
							onChange={(e) => setFiles(e.target.files)}
							className="p-3 border border-gray-300 rounded w-full"
							type="file"
							id="images"
							accept="image/*"
							multiple
							ref={fileInputRef}
						/>
						<button
							disabled={uploading}
							onClick={handleImageSubmit}
							className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
						>
							{uploading ? "Uploading..." : "Upload"}
						</button>
					</div>

					{formData.imageUrls.length > 0 &&
						formData.imageUrls.map((url, index) => (
							<div
								key={url}
								className="flex justify-between p-3 border items-center"
							>
								<img
									src={url}
									alt="listing image"
									className="w-20 h-20 object-contain rounded-lg"
								/>
								<button
									type="button"
									onClick={() => deleteFile(url)}
									className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
								>
									Delete
								</button>
							</div>
						))}
					<button
						disabled={loading || uploading}
						className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
					>
						{loading ? "Updating..." : "Update listing"}
					</button>
					{error && <p className="text-red-700 text-sm">{error}</p>}
				</div>
			</form>
		</main>
	);
}
