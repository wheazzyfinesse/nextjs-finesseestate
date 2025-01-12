"use client";
import { deleteFileByUrl, uploadMultipleFiles } from "@/lib/actions/uploadFile";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

const CreateListing = () => {
	const { isSignedIn, isLoaded, user } = useUser();
	const [files, setFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [uploadingError, setUploadingError] = useState(false);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);
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

	const router = useRouter();
	const fileInputRef = useRef(null);

	const handleImageSubmit = async (e) => {
		e.preventDefault();
		setUploading(true);
		setUploadingError(false);
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

		if (formData.imageUrls.length < 1) {
			toast.error("You must upload at least one image");
			return setError("You must upload at least one image");
		}
		if (+formData.regularPrice < +formData.discountPrice) {
			toast.error("Discount price must be lower than regular price");
			return setError("Discount price must be lower than regular price");
		}
		setLoading(true);
		setError(false);
		const res = await fetch("/api/listing/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...formData,
				userMongoId: user.publicMetadata.userMongoId,
			}),
		});
		const data = await res.json();
		if (data.error) {
			console.log(data);
			toast.error(data.message);
			setLoading(false);
			return setError(data.message);
		}
		router.push(`/listing/${data._id}`);
		toast.success("Listing created successfully");
		setLoading(false);
		return;
	};

	if (!isLoaded) {
		return (
			<h1 className="text-center text-xl my-7 font-semibold">Loading...</h1>
		);
	}
	if (!isSignedIn) {
		return (
			<h1 className="text-center text-xl my-7 font-semibold">
				You are not authorized to view this page please
				<Link className="text-slate-500" href="sign-in">
					{" "}
					sign in{" "}
				</Link>
				now
			</h1>
		);
	}

	return (
		<main className="mx-auto p-3 max-w-4xl">
			<h1 className="text-center my-7 text-3xl font-semibold">
				Create a New Listing
			</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
				<div className="flex-1 flex flex-col gap-4">
					<input
						type="text"
						placeholder="Name"
						id="name"
						maxLength="62"
						className="border p-3 rounded-lg"
						minLength="10"
						required
						onChange={handleChange}
						value={formData.name}
					/>

					<textarea
						type="text"
						id="description"
						className="border p-3 rounded-lg"
						placeholder="Description"
						required
						onChange={handleChange}
						value={formData.description}
					/>

					<input
						type="text"
						placeholder="Address"
						id="address"
						className="border p-3 rounded-lg"
						required
						onChange={handleChange}
						value={formData.address}
					/>

					<div className="flex flex-wrap gap-6">
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
							<span>Parking Spot</span>
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
								className="border border-gray-300 p-3 rounded-lg"
								required
								onChange={handleChange}
								value={formData.bedrooms}
							/>
							<p>Bed</p>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="number"
								min="1"
								max="10"
								id="bathrooms"
								className="border border-gray-300 p-3 rounded-lg"
								required
								onChange={handleChange}
								value={formData.bathrooms}
							/>
							<p>Baths</p>
						</div>

						<div className="flex items-center gap-2">
							<input
								type="number"
								min="50"
								max="1000000"
								id="regularPrice"
								className="border border-gray-300 p-3 rounded-lg"
								required
								onChange={handleChange}
								value={formData.regularPrice}
							/>
							<div className="flex flex-col items-center">
								<p>Regular Price</p>
								<span className="text-xs">($/month)</span>
							</div>
						</div>

						{formData.offer && (
							<div className="flex items-center gap-2">
								<input
									type="number"
									min="0"
									max="10000"
									id="discountPrice"
									className="border border-gray-300 p-3 rounded-lg"
									required
									onChange={handleChange}
									value={formData.discountPrice}
								/>
								<div className="flex flex-col items-center">
									<p>Discounted Price</p>
									<span className="text-xs">($/month)</span>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-4">
					<p className="font-semibold">
						Images:
						<span className="font-normal ml-2 text-gray-600">
							The first image will be the cover (Max 6 images, 2MB each)
						</span>
					</p>
					<div className="flex gap-4">
						<input
							type="file"
							id="images"
							accept="image/*"
							multiple
							ref={fileInputRef}
							className="p-3 border border-gray-300 rounded w-full"
							onChange={(e) => setFiles(e.target.files)}
						/>
						<button
							disabled={uploading}
							onClick={handleImageSubmit}
							className="p-3 uppercase rounded border text-green-700 border-green-700 hover:shadow-lg disabled:opacity-80"
						>
							{uploading ? "uploading..." : "upload"}
						</button>
					</div>
					{uploadingError && (
						<div className="text-red-500 text-sm">Error uploading images</div>
					)}
					{formData.imageUrls.length > 0 && (
						<div className="flex flex-col gap-4">
							{formData.imageUrls.map((url) => (
								<div
									key={url}
									className="flex justify-between p-3 border items-center"
								>
									<img
										src={url}
										alt="Listing Image"
										className="w-20 h-20 object-cover rounded-lg"
									/>
									<button
										type="button"
										onClick={() => deleteFile(url)}
										className="p3 text-red-700 rounded-lg uppercase hover:opacity-75"
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}
					<button
						disabled={loading || uploading}
						className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
					>
						{loading ? "creating..." : "Create New Listing"}
					</button>
					{error && <p className="text-red-700 text-sm">{error}</p>}
				</div>
			</form>
		</main>
	);
};
export default CreateListing;
