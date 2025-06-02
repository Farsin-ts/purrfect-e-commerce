import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    _id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    subCategory: '',
    sizes: [],
    bestseller: false,
    image: []
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Static categories and subcategories
  const categories = ['Dog', 'Cat']; // Matching your Add component
  const subCategories = ['Food', 'Care', 'Toy']; // Matching your Add component

  const openEditModal = (product) => {
    setEditMode(true);
    
    // Ensure sizes is properly formatted as array
    let formattedSizes = [];
    try {
      formattedSizes = Array.isArray(product.sizes) ? 
        product.sizes : 
        typeof product.sizes === 'string' ? 
          JSON.parse(product.sizes) : 
          [];
    } catch (error) {
      console.error("Error parsing sizes:", error);
      formattedSizes = [];
    }

    setEditData({
      ...product,
      sizes: formattedSizes.map(size => typeof size === 'string' ? { size } : size)
    });
    setSelectedImages([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSizeChange = (index, value) => {
    const updatedSizes = [...editData.sizes];
    updatedSizes[index] = { size: value };
    setEditData(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  const addSizeField = () => {
    setEditData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '' }]
    }));
  };

  const removeSizeField = (index) => {
    const updatedSizes = [...editData.sizes];
    updatedSizes.splice(index, 1);
    setEditData(prev => ({
      ...prev,
      sizes: updatedSizes
    }));
  };

  const handleImageChange = (e) => {
    setSelectedImages(Array.from(e.target.files));
  };

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message);
    }
  };

  const editProduct = async () => {
    try {
      const formData = new FormData();
  
      // Append all fields
      formData.append('name', editData.name);
      formData.append('description', editData.description);
      formData.append('price', String(editData.price));
      formData.append('category', editData.category);
      formData.append('subCategory', editData.subCategory);
      formData.append('sizes', JSON.stringify(editData.sizes.map(s => s.size)));
      formData.append('bestseller', editData.bestseller ? "true" : "false");
  

      if (selectedImages && selectedImages.length > 0) {
        selectedImages.forEach((file, index) => {
          if (file instanceof File) {
            formData.append(`image${index + 1}`, file);
          } else {
            console.warn("Skipping invalid file:", file);
          }
        });
      }

      
      // Append new images
      selectedImages.forEach((file, index) => {
        formData.append(`image${index + 1}`, file);
      });
  
      // Debug: Log the complete request payload
      console.log("Editing Product:", {
        name: editData.name,
        description: editData.description,
        price: editData.price,
        category: editData.category,
        subCategory: editData.subCategory,
        sizes: editData.sizes.map(s => s.size),
        bestseller: editData.bestseller,
        selectedImagesCount: selectedImages.length,
      });

      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
      
  
      // API request to update the product
      const response = await axios.put(
        `${backendUrl}/api/product/edit/${editData._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      if (response.data.success) {
        toast.success('Product updated successfully!');
        setEditMode(false);
        await fetchList(); // Refresh product list after editing
      } else {
        toast.error(response.data.message || 'Failed to update product.');
      }
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || 'Failed to update product. Check console for details.');
    }
  };
  

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">All Products List</h2>
      
      {isLoading && !editMode ? (
        <div className="text-center py-8">Loading products...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Image</th>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Category</th>
                <th className="py-2 px-4 border">Price</th>
                <th className="py-2 px-4 border">Bestseller</th>
                <th className="py-2 px-4 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">
                    <img className="w-12 h-12 object-cover" src={item.image[0]} alt={item.name} />
                  </td>
                  <td className="py-2 px-4 border">{item.name}</td>
                  <td className="py-2 px-4 border">{item.category}</td>
                  <td className="py-2 px-4 border">{currency}{item.price}</td>
                  <td className="py-2 px-4 border">{item.bestseller ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeProduct(item._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Edit Product</h3>
                <button 
                  onClick={() => setEditMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={editData.price}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Category</label>
                    <select
                      name="category"
                      value={editData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Sub Category</label>
                    <select
                      name="subCategory"
                      value={editData.subCategory}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Sub Category</option>
                      {subCategories.map((subCat) => (
                        <option key={subCat} value={subCat}>{subCat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Sizes</label>
                  <div className="space-y-2">
                    {editData.sizes.map((sizeObj, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={sizeObj.size || ''}
                          onChange={(e) => handleSizeChange(index, e.target.value)}
                          placeholder="Size (e.g., S, M, L)"
                          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeSizeField(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSizeField}
                      className="mt-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Size
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {editData.image.map((img, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={img} 
                          alt={`Product ${index + 1}`} 
                          className="w-full h-24 object-cover rounded"
                        />
                        <span className="absolute top-1 right-1 bg-black text-white text-xs px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded"
                    accept="image/*"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Select new images to replace existing ones
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bestseller"
                    name="bestseller"
                    checked={editData.bestseller}
                    onChange={handleCheckboxChange}
                    className="mr-2 h-5 w-5"
                  />
                  <label htmlFor="bestseller" className="font-medium">
                    Mark as bestseller
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editProduct}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;