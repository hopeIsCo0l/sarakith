'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  Plus,
  Trash2,
  Edit,
  Eye,
  Upload,
  RefreshCw,
  Search,
  LogOut,
  AlertTriangle,
  X,
  ImageIcon,
  CheckCircle2,
  Layers,
  Sparkles,
  Zap,
  Wrench,
  Building2,
  Phone,
} from 'lucide-react';
import {
  getCategories,
  getProducts,
  getServices,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createService,
  updateService,
  deleteService,
  uploadImageToSupabase,
  getDatabaseDiagnostics,
  getSiteSettings,
  updateSiteSetting,
  supabase,
} from '@/lib/supabase';
import { Category, Product, Service, StockStatus, SiteSetting } from '@/lib/types';
import { COMPANY_NAME } from '@/lib/constants';

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'services' | 'settings'>('products');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [siteSettingsMap, setSiteSettingsMap] = useState<Record<string, SiteSetting>>({});
  const [savingSettingKey, setSavingSettingKey] = useState<string | null>(null);
  const [previewBgMode, setPreviewBgMode] = useState<Record<string, 'default' | 'dark' | 'light'>>({});
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Database Diagnostics State
  const [dbDiag, setDbDiag] = useState<{
    connected: boolean;
    url: string;
    categoriesCount: number;
    productsCount: number;
    servicesCount: number;
    error: string | null;
  } | null>(null);

  // -------------------------------------------------------------
  // FORM STATE: PRODUCT
  // -------------------------------------------------------------
  const [prodName, setProdName] = useState('');
  const [prodCategorySlug, setProdCategorySlug] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(10000);
  const [prodSku, setProdSku] = useState('');
  const [prodStockStatus, setProdStockStatus] = useState<StockStatus>('in_stock');
  const [prodDescription, setProdDescription] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(true);
  const [prodImageUrls, setProdImageUrls] = useState<string[]>([]);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Tech Specs Matrix & Delivery Fields
  const [specBrand, setSpecBrand] = useState('Sara Power Certified');
  const [specCapacity, setSpecCapacity] = useState('');
  const [specVoltage, setSpecVoltage] = useState('');
  const [specWeight, setSpecWeight] = useState('');
  const [specWarranty, setSpecWarranty] = useState('5-Year Manufacturer Warranty / 6,000+ Cycles');
  const [deliveryAvailable, setDeliveryAvailable] = useState('Addis Ababa Delivery Available');

  // -------------------------------------------------------------
  // FORM STATE: CATEGORY
  // -------------------------------------------------------------
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catDisplayOrder, setCatDisplayOrder] = useState<number>(1);

  // -------------------------------------------------------------
  // FORM STATE: SERVICE
  // -------------------------------------------------------------
  const [srvTitle, setSrvTitle] = useState('');
  const [srvSlug, setSrvSlug] = useState('');
  const [srvSubtitle, setSrvSubtitle] = useState('');
  const [srvDescription, setSrvDescription] = useState('');
  const [srvSpecsText, setSrvSpecsText] = useState('');
  const [srvPriceRange, setSrvPriceRange] = useState('Custom Quote');

  // Check Session Auth on Mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('Sara Power_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Cross-Tab & Realtime Sync Helper
  const notifyDataChanged = () => {
    try {
      window.dispatchEvent(new Event('sara_data_updated'));
      if (typeof BroadcastChannel !== 'undefined') {
        const broadcast = new BroadcastChannel('sara_power_sync');
        broadcast.postMessage({ type: 'DATA_CHANGED', timestamp: Date.now() });
        broadcast.close();
      }
    } catch (err) {}
  };

  // Toast Helpers
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const showErrorToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 6000);
  };

  // Load Data and Run Diagnostics
  const loadAllData = async () => {
    setLoading(true);
    const [cats, prods, srvs, diag, settings] = await Promise.all([
      getCategories(),
      getProducts(),
      getServices(),
      getDatabaseDiagnostics(),
      getSiteSettings(),
    ]);
    setCategories(cats);
    setProducts(prods);
    setServices(srvs);
    setDbDiag(diag);
    setSiteSettingsMap(settings as Record<string, SiteSetting>);
    setLoading(false);
  };

  const handleSaveSiteSetting = async (key: string, name: string, url: string, category: string, alt_text?: string) => {
    setSavingSettingKey(key);
    const { success, error } = await updateSiteSetting(key, name, url, category, alt_text);
    if (error) {
      showErrorToast(`Setting Update Error: ${error}`);
    } else {
      showToast(`Asset "${name}" updated successfully.`);
      notifyDataChanged();
      setSiteSettingsMap((prev) => ({
        ...prev,
        [key]: {
          key,
          name,
          url,
          category,
          alt_text,
          updated_at: new Date().toISOString(),
        },
      }));
    }
    setSavingSettingKey(null);
  };

  const handleAssetFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setSavingSettingKey(key);
    const uploadedUrl = await uploadImageToSupabase(file, `assets-${key}`);
    if (uploadedUrl) {
      const currentSetting = siteSettingsMap[key];
      setSiteSettingsMap((prev) => ({
        ...prev,
        [key]: {
          ...currentSetting,
          key,
          name: currentSetting?.name || key,
          url: uploadedUrl,
          category: currentSetting?.category || 'branding',
        },
      }));
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        const currentSetting = siteSettingsMap[key];
        setSiteSettingsMap((prev) => ({
          ...prev,
          [key]: {
            ...currentSetting,
            key,
            name: currentSetting?.name || key,
            url: base64Url,
            category: currentSetting?.category || 'branding',
          },
        }));
      };
      reader.readAsDataURL(file);
    }
    setSavingSettingKey(null);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Sara Power2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('Sara Power_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('Sara Power_admin_auth');
  };

  // -------------------------------------------------------------
  // PRODUCT CRUD HANDLERS
  // -------------------------------------------------------------
  const openNewProductModal = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategorySlug(categories[0]?.slug || '');
    setProdPrice(10000);
    setProdSku(`SEB-${Math.floor(1000 + Math.random() * 9000)}`);
    setProdStockStatus('in_stock');
    setProdDescription('');
    setProdIsFeatured(true);
    setProdImageUrls([]);
    setManualUrlInput('');
    setSpecBrand('Sara Power Certified');
    setSpecCapacity('');
    setSpecVoltage('');
    setSpecWeight('');
    setSpecWarranty('5-Year Manufacturer Warranty / 6,000+ Cycles');
    setDeliveryAvailable('Addis Ababa Delivery Available');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdCategorySlug(product.category?.slug || categories[0]?.slug || '');
    setProdPrice(product.price);
    setProdSku(product.sku || '');
    setProdStockStatus(product.stock_status);
    setProdDescription(product.description || '');
    setProdIsFeatured(product.is_featured);
    const existingImages = product.images?.map((img) => img.url) || [];
    setProdImageUrls(existingImages);
    setManualUrlInput('');
    setSpecBrand(product.details?.brand || 'Sara Power Certified');
    setSpecCapacity(product.details?.capacity || product.details?.power_output || '');
    setSpecVoltage(product.details?.voltage || '');
    setSpecWeight(product.details?.weight || '');
    setSpecWarranty(product.details?.warranty || '5-Year Manufacturer Warranty / 6,000+ Cycles');
    setDeliveryAvailable(
      typeof product.delivery_available === 'string'
        ? product.delivery_available
        : product.details?.delivery_available || 'Addis Ababa Delivery Available'
    );
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('Please enter a product name');
      return;
    }

    setSubmitting(true);
    const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const selectedCat = categories.find((c) => c.slug === prodCategorySlug) || categories[0];

    const finalImages =
      prodImageUrls.length > 0
        ? prodImageUrls
        : ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1000&auto=format&fit=crop'];

    const detailsObj: Record<string, string> = {};
    if (specBrand) detailsObj.brand = specBrand.trim();
    if (specCapacity) detailsObj.capacity = specCapacity.trim();
    if (specVoltage) detailsObj.voltage = specVoltage.trim();
    if (specWeight) detailsObj.weight = specWeight.trim();
    if (specWarranty) detailsObj.warranty = specWarranty.trim();
    if (deliveryAvailable) detailsObj.delivery_available = deliveryAvailable.trim();

    if (editingProductId) {
      // UPDATE EXISTING PRODUCT
      const { success, error } = await updateProduct(
        editingProductId,
        {
          name: prodName,
          category_id: selectedCat?.id,
          price: Number(prodPrice),
          stock_status: prodStockStatus,
          is_featured: prodIsFeatured,
          description: prodDescription,
          sku: prodSku,
          details: detailsObj,
        },
        finalImages
      );

      if (error) {
        showErrorToast(`Database Error: ${error}`);
      } else {
        showToast(`Product "${prodName}" updated successfully!`);
      }

      // Local state update for instant UI feedback
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                name: prodName,
                category: selectedCat,
                category_id: selectedCat?.id,
                price: Number(prodPrice),
                stock_status: prodStockStatus,
                is_featured: prodIsFeatured,
                description: prodDescription,
                sku: prodSku,
                details: detailsObj,
                images: finalImages.map((url, i) => ({
                  id: `img-${i}`,
                  product_id: editingProductId,
                  url,
                  is_primary: i === 0,
                  display_order: i,
                })),
              }
            : p
        )
      );

      setSubmitting(false);
      setIsProductModalOpen(false);
      notifyDataChanged();
      loadAllData();
    } else {
      // CREATE NEW PRODUCT
      const { product: newProd, error } = await createProduct(
        {
          category_id: selectedCat?.id,
          name: prodName,
          slug,
          sku: prodSku || `SEB-${Math.floor(1000 + Math.random() * 9000)}`,
          price: Number(prodPrice),
          currency: 'ETB',
          description: prodDescription || `${prodName} supplied by Sara Power Solution plc.`,
          details: detailsObj,
          is_featured: prodIsFeatured,
          is_visible: true,
          stock_status: prodStockStatus,
        },
        finalImages
      );

      if (error) {
        showErrorToast(`Database Error: ${error}`);
      } else {
        showToast(`Product "${prodName}" created successfully!`);
      }

      // Fallback local addition if running without backend tables
      const newProductItem: Product = newProd || {
        id: `prod-${Date.now()}`,
        name: prodName,
        slug,
        sku: prodSku || `SEB-${Math.floor(1000 + Math.random() * 9000)}`,
        price: Number(prodPrice),
        currency: 'ETB',
        category_id: selectedCat?.id,
        category: selectedCat,
        description: prodDescription || `${prodName} supplied by Sara Power Solution plc.`,
        details: detailsObj,
        is_featured: prodIsFeatured,
        is_visible: true,
        stock_status: prodStockStatus,
        created_at: new Date().toISOString(),
        images: finalImages.map((url, i) => ({
          id: `img-${Date.now()}-${i}`,
          product_id: `prod-${Date.now()}`,
          url,
          is_primary: i === 0,
          display_order: i,
        })),
      };

      setProducts((prev) => [newProductItem, ...prev]);
      setSubmitting(false);
      setIsProductModalOpen(false);
      notifyDataChanged();
      loadAllData();
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      const { error } = await deleteProduct(id);
      if (error) {
        showErrorToast(`Database Delete Error: ${error}`);
      } else {
        showToast(`Product "${name}" deleted.`);
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      notifyDataChanged();
      loadAllData();
    }
  };

  const handleToggleStock = async (id: string, currentStatus: StockStatus) => {
    const nextStatus: StockStatus = currentStatus === 'in_stock' ? 'sold_out' : 'in_stock';
    await updateProduct(id, { stock_status: nextStatus });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_status: nextStatus } : p))
    );
    notifyDataChanged();
    showToast(`Stock status updated to ${nextStatus.replace('_', ' ')}.`);
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    await updateProduct(id, { is_featured: !currentFeatured });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_featured: !currentFeatured } : p))
    );
    notifyDataChanged();
    showToast(`Featured status toggled.`);
  };

  // Upload image handler
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newUploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadImageToSupabase(file);
      if (url) {
        newUploadedUrls.push(url);
      }
    }

    setProdImageUrls((prev) => [...prev, ...newUploadedUrls]);
    setUploadingImage(false);
    e.target.value = '';
  };

  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    setProdImageUrls((prev) => [...prev, manualUrlInput.trim()]);
    setManualUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setProdImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------
  // CATEGORY CRUD HANDLERS
  // -------------------------------------------------------------
  const openNewCategoryModal = () => {
    setEditingCategoryId(null);
    setCatName('');
    setCatSlug('');
    setCatDescription('');
    setCatDisplayOrder(categories.length + 1);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDescription(cat.description || '');
    setCatDisplayOrder(cat.display_order);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmitting(true);
    const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingCategoryId) {
      // UPDATE CATEGORY
      const { success, error } = await updateCategory(editingCategoryId, {
        name: catName,
        slug,
        description: catDescription,
        display_order: Number(catDisplayOrder),
      });

      if (error) {
        showErrorToast(`Database Category Error: ${error}`);
      } else {
        showToast(`Category "${catName}" updated.`);
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategoryId
            ? { ...c, name: catName, slug, description: catDescription, display_order: Number(catDisplayOrder) }
            : c
        )
      );
    } else {
      // CREATE CATEGORY
      const { category: newCat, error } = await createCategory({
        name: catName,
        slug,
        description: catDescription,
        display_order: Number(catDisplayOrder),
      });

      if (error) {
        showErrorToast(`Database Category Error: ${error}`);
      } else {
        showToast(`Category "${catName}" added.`);
      }

      const catItem: Category = newCat || {
        id: `cat-${Date.now()}`,
        name: catName,
        slug,
        description: catDescription,
        display_order: Number(catDisplayOrder),
        created_at: new Date().toISOString(),
      };

      setCategories((prev) => [...prev, catItem]);
    }

    setSubmitting(false);
    setIsCategoryModalOpen(false);
    notifyDataChanged();
    loadAllData();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      const { error } = await deleteCategory(id);
      if (error) {
        showErrorToast(`Database Delete Error: ${error}`);
      } else {
        showToast(`Category "${name}" deleted.`);
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      notifyDataChanged();
      loadAllData();
    }
  };

  // -------------------------------------------------------------
  // SERVICE CRUD HANDLERS
  // -------------------------------------------------------------
  const openNewServiceModal = () => {
    setEditingServiceId(null);
    setSrvTitle('');
    setSrvSlug('');
    setSrvSubtitle('');
    setSrvDescription('');
    setSrvSpecsText('Site Load Assessment\nEquipment Commissioning\nPreventative Maintenance');
    setSrvPriceRange('Custom Quote');
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (srv: Service) => {
    setEditingServiceId(srv.id);
    setSrvTitle(srv.title);
    setSrvSlug(srv.slug);
    setSrvSubtitle(srv.subtitle || '');
    setSrvDescription(srv.description);
    setSrvSpecsText(srv.specifications?.join('\n') || '');
    setSrvPriceRange(srv.price_range || 'Custom Quote');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle.trim()) return;

    setSubmitting(true);
    const slug = srvSlug.trim() || srvTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const specsArray = srvSpecsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingServiceId) {
      // UPDATE SERVICE
      const { success, error } = await updateService(editingServiceId, {
        title: srvTitle,
        slug,
        subtitle: srvSubtitle,
        description: srvDescription,
        specifications: specsArray,
        price_range: srvPriceRange,
      });

      if (error) {
        showErrorToast(`Database Service Error: ${error}`);
      } else {
        showToast(`Service "${srvTitle}" updated.`);
      }

      setServices((prev) =>
        prev.map((s) =>
          s.id === editingServiceId
            ? {
                ...s,
                title: srvTitle,
                slug,
                subtitle: srvSubtitle,
                description: srvDescription,
                specifications: specsArray,
                price_range: srvPriceRange,
              }
            : s
        )
      );
    } else {
      // CREATE SERVICE
      const { service: newSrv, error } = await createService({
        title: srvTitle,
        slug,
        subtitle: srvSubtitle,
        description: srvDescription,
        specifications: specsArray,
        price_range: srvPriceRange,
        is_active: true,
        display_order: services.length + 1,
      });

      if (error) {
        showErrorToast(`Database Service Error: ${error}`);
      } else {
        showToast(`Service "${srvTitle}" added.`);
      }

      const srvItem: Service = newSrv || {
        id: `srv-${Date.now()}`,
        title: srvTitle,
        slug,
        subtitle: srvSubtitle,
        description: srvDescription,
        specifications: specsArray,
        price_range: srvPriceRange,
        is_active: true,
        display_order: services.length + 1,
        created_at: new Date().toISOString(),
      };

      setServices((prev) => [...prev, srvItem]);
    }

    setSubmitting(false);
    setIsServiceModalOpen(false);
    notifyDataChanged();
    loadAllData();
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete service "${title}"?`)) {
      const { error } = await deleteService(id);
      if (error) {
        showErrorToast(`Database Delete Error: ${error}`);
      } else {
        showToast(`Service "${title}" deleted.`);
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
      notifyDataChanged();
      loadAllData();
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' || p.category?.slug === selectedCategoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-kith-card border border-kith-border p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-kith-subBg border border-kith-border rounded-full text-kith-bone mb-2">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-kith uppercase text-kith-bone">
              {COMPANY_NAME}
            </h1>
            <p className="text-xs font-mono text-kith-muted uppercase tracking-widest">
              ADMINISTRATIVE DESK & CRUD OPERATIONS
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-superwide text-kith-muted uppercase">
                ENTER ADMIN PASSCODE
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode (Default: Sara Power2026)"
                className="w-full bg-kith-subBg border border-kith-border px-4 py-3 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Invalid passcode. Try "Sara Power2026".
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold transition-all shadow-lg"
            >
              UNLOCK ADMIN DASHBOARD →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Toast Notifications */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-rose-600 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 max-w-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-kith-border pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-superwide text-kith-muted uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sara Power Solution plc // LIVE CATALOG MANAGEMENT & CRUD OPERATIONS
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-kith-bone flex items-center gap-3">
            EQUIPMENT ADMIN DASHBOARD
          </h1>
        </div>

        {/* Action Controls & Logout */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadAllData}
            className="px-3.5 py-2 border border-kith-border bg-kith-card text-kith-bone hover:border-kith-bone text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Refresh Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>

          {activeTab === 'products' && (
            <button
              onClick={openNewProductModal}
              className="px-4 py-2 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> ADD PRODUCT
            </button>
          )}

          {activeTab === 'categories' && (
            <button
              onClick={openNewCategoryModal}
              className="px-4 py-2 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> ADD CATEGORY
            </button>
          )}

          {activeTab === 'services' && (
            <button
              onClick={openNewServiceModal}
              className="px-4 py-2 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> ADD SERVICE
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2 border border-kith-border bg-kith-card text-kith-muted hover:text-rose-400 hover:border-rose-400/50 transition-colors"
            title="Logout Admin Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-kith-card border border-kith-border p-5 space-y-1">
          <span className="text-[10px] font-mono text-kith-darkMuted uppercase block">TOTAL PRODUCTS</span>
          <span className="text-2xl font-mono font-extrabold text-kith-bone">{products.length}</span>
        </div>
        <div className="bg-kith-card border border-kith-border p-5 space-y-1">
          <span className="text-[10px] font-mono text-kith-darkMuted uppercase block">CATEGORIES</span>
          <span className="text-2xl font-mono font-extrabold text-sky-400">{categories.length}</span>
        </div>
        <div className="bg-kith-card border border-kith-border p-5 space-y-1">
          <span className="text-[10px] font-mono text-kith-darkMuted uppercase block">IN STOCK ITEMS</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-500">
            {products.filter((p) => p.stock_status === 'in_stock').length}
          </span>
        </div>
        <div className="bg-kith-card border border-kith-border p-5 space-y-1">
          <span className="text-[10px] font-mono text-kith-darkMuted uppercase block">ACTIVE SERVICES</span>
          <span className="text-2xl font-mono font-extrabold text-amber-500">{services.length}</span>
        </div>
      </div>

      {/* Tab Switcher & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-kith-border pb-4">
        <div className="flex items-center gap-2 border border-kith-border bg-kith-card p-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
              activeTab === 'products'
                ? 'bg-kith-btnPrimaryBg text-kith-btnPrimaryText font-bold shadow'
                : 'text-kith-muted hover:text-kith-bone'
            }`}
          >
            PRODUCTS ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
              activeTab === 'categories'
                ? 'bg-kith-btnPrimaryBg text-kith-btnPrimaryText font-bold shadow'
                : 'text-kith-muted hover:text-kith-bone'
            }`}
          >
            CATEGORIES ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
              activeTab === 'services'
                ? 'bg-kith-btnPrimaryBg text-kith-btnPrimaryText font-bold shadow'
                : 'text-kith-muted hover:text-kith-bone'
            }`}
          >
            SERVICES ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
              activeTab === 'settings'
                ? 'bg-kith-btnPrimaryBg text-kith-btnPrimaryText font-bold shadow'
                : 'text-kith-muted hover:text-kith-bone'
            }`}
          >
            BRANDING & SITE ASSETS
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone uppercase outline-none"
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inventory..."
                className="w-full bg-kith-subBg border border-kith-border px-3 py-2 pl-9 text-xs font-mono text-kith-bone placeholder-kith-darkMuted focus:outline-none focus:border-kith-bone"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-kith-darkMuted" />
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRODUCTS TAB: FULL CRUD TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="bg-kith-card border border-kith-border overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-kith-border">
            <thead className="bg-kith-subBg text-kith-muted uppercase tracking-widest text-[10px]">
              <tr>
                <th className="py-3.5 px-4">ITEM & PHOTOS</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">STOCK STATUS</th>
                <th className="py-3.5 px-4">FEATURED</th>
                <th className="py-3.5 px-4 text-right">CRUD ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-kith-border/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-kith-muted">
                    No products found in inventory.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const primaryImg =
                    p.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1000&auto=format&fit=crop';
                  const imgCount = p.images?.length || 1;
                  return (
                    <tr key={p.id} className="hover:bg-kith-subBg/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-kith-subBg border border-kith-border overflow-hidden flex-shrink-0">
                          <Image src={primaryImg} alt={p.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-0.5 max-w-xs">
                          <Link
                            href={`/catalog/${p.slug}`}
                            className="font-bold text-kith-bone hover:text-amber-500 line-clamp-1"
                          >
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-2">
                            {p.sku && (
                              <span className="text-[10px] text-kith-darkMuted block">
                                SKU: {p.sku}
                              </span>
                            )}
                            <span className="text-[9px] px-1.5 py-0.5 bg-kith-subBg border border-kith-border text-kith-muted font-mono">
                              📸 {imgCount} {imgCount === 1 ? 'photo' : 'photos'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-kith-muted uppercase">
                        {p.category?.name || 'UNASSIGNED'}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStock(p.id, p.stock_status)}
                          className={`px-2.5 py-1 text-[9px] uppercase tracking-widest border transition-colors ${
                            p.stock_status === 'in_stock'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {p.stock_status.replace('_', ' ')}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                          className={`text-xs ${
                            p.is_featured ? 'text-amber-500 font-bold' : 'text-kith-darkMuted'
                          }`}
                        >
                          {p.is_featured ? '★ YES' : '☆ NO'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link
                          href={`/catalog/${p.slug}`}
                          className="p-1.5 inline-block text-kith-muted hover:text-kith-bone border border-kith-border hover:border-kith-bone"
                          title="View Specs Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-1.5 inline-block text-sky-400 hover:text-sky-300 border border-kith-border hover:border-sky-400/50"
                          title="Edit Product Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 inline-block text-rose-500 hover:text-rose-400 border border-kith-border hover:border-rose-400/50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORIES TAB: FULL CRUD TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="bg-kith-card border border-kith-border overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-kith-border">
            <thead className="bg-kith-subBg text-kith-muted uppercase tracking-widest text-[10px]">
              <tr>
                <th className="py-3.5 px-4">CATEGORY NAME</th>
                <th className="py-3.5 px-4">SLUG</th>
                <th className="py-3.5 px-4">DESCRIPTION</th>
                <th className="py-3.5 px-4">PRODUCTS</th>
                <th className="py-3.5 px-4 text-right">CRUD ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kith-border/60">
              {categories.map((cat) => {
                const prodCount = products.filter((p) => p.category?.slug === cat.slug).length;
                return (
                  <tr key={cat.id} className="hover:bg-kith-subBg/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-kith-bone uppercase">{cat.name}</td>
                    <td className="py-3.5 px-4 text-sky-400 font-mono">{cat.slug}</td>
                    <td className="py-3.5 px-4 text-kith-muted max-w-md truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-kith-bone font-bold">{prodCount} items</td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 inline-block text-sky-400 hover:text-sky-300 border border-kith-border hover:border-sky-400/50"
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 inline-block text-rose-500 hover:text-rose-400 border border-kith-border hover:border-rose-400/50"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SERVICES TAB: FULL CRUD CARDS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => (
            <div
              key={srv.id}
              className="bg-kith-card border border-kith-border p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-kith-darkMuted uppercase">
                    SERVICE 0{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                    {srv.price_range || 'Custom Quote'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-kith-bone uppercase font-mono">{srv.title}</h3>
                <p className="text-xs text-kith-muted font-mono leading-relaxed">{srv.description}</p>
                {srv.specifications && srv.specifications.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-kith-border">
                    <span className="text-[10px] font-mono text-kith-darkMuted uppercase block">
                      Scope of Work:
                    </span>
                    {srv.specifications.map((spec, sIdx) => (
                      <div key={sIdx} className="text-[11px] font-mono text-kith-bone flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CRUD Action Buttons */}
              <div className="pt-4 border-t border-kith-border flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditServiceModal(srv)}
                  className="px-3 py-1.5 bg-kith-subBg border border-kith-border hover:border-sky-400 text-sky-400 text-xs font-mono uppercase flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteService(srv.id, srv.title)}
                  className="px-3 py-1.5 bg-kith-subBg border border-kith-border hover:border-rose-400 text-rose-500 text-xs font-mono uppercase flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BRANDING & SITE SETTINGS MANAGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          <div className="bg-kith-subBg/90 border border-kith-border p-6 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-sara-red dark:text-red-400 font-mono text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4" /> DYNAMIC BRANDING, ABOUT US & CONTACT MANAGER
            </div>
            <p className="text-xs font-mono text-kith-muted leading-relaxed">
              Manage platform logos, hero banners, company mission statement, contact phone numbers, physical address, business hours, and capacity metrics in real-time across the platform.
            </p>
          </div>

          {/* Section 1: Visual Image Assets (Logos & Banners) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-mono text-kith-bone uppercase border-b border-kith-border pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sara-red dark:text-red-400" />
              1. LOGOS & PAGE HERO BANNERS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(siteSettingsMap)
                .filter(([_, s]) => s.category === 'logo' || s.category === 'banner' || s.category === 'branding')
                .map(([key, setting]) => {
                  const currentBgMode = previewBgMode[key] || 'default';
                  const isSaving = savingSettingKey === key;

                  return (
                    <div
                      key={key}
                      className="bg-kith-card border border-kith-border p-5 rounded-sm space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-kith-border pb-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-sara-red dark:text-red-400" />
                            <span className="font-mono text-xs font-bold text-kith-bone uppercase tracking-wider">
                              {setting.name || key}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-kith-subBg border border-kith-border text-kith-muted uppercase">
                            {setting.category || 'branding'}
                          </span>
                        </div>

                        <div className="px-2.5 py-1.5 bg-sara-red/10 border border-sara-red/30 rounded-sm text-[10px] font-mono text-sara-red dark:text-red-400 flex items-center gap-1.5 font-semibold">
                          <Zap className="w-3 h-3 flex-shrink-0 text-amber-500" />
                          <span>
                            Recommended: {setting.recommended_dimensions || (setting.category === 'logo' ? '512 x 512 px (1:1 Ratio, Transparent PNG)' : '1920 x 1080 px (16:9 Ratio)')}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-kith-muted">
                            <span>LIVE PREVIEW:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewBgMode((prev) => ({ ...prev, [key]: 'dark' }))}
                                className={`px-2 py-0.5 text-[9px] border ${
                                  currentBgMode === 'dark' ? 'bg-black text-white border-sara-red' : 'bg-kith-subBg border-kith-border text-kith-muted'
                                }`}
                              >
                                Dark
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewBgMode((prev) => ({ ...prev, [key]: 'light' }))}
                                className={`px-2 py-0.5 text-[9px] border ${
                                  currentBgMode === 'light' ? 'bg-white text-black border-sara-red font-bold' : 'bg-kith-subBg border-kith-border text-kith-muted'
                                }`}
                              >
                                Light
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewBgMode((prev) => ({ ...prev, [key]: 'default' }))}
                                className={`px-2 py-0.5 text-[9px] border ${
                                  currentBgMode === 'default' ? 'bg-kith-card border-kith-bone text-kith-bone' : 'bg-kith-subBg border-kith-border text-kith-muted'
                                }`}
                              >
                                Auto
                              </button>
                            </div>
                          </div>

                          <div
                            className={`h-36 w-full rounded border border-kith-border flex items-center justify-center p-3 overflow-hidden relative ${
                              currentBgMode === 'dark'
                                ? 'bg-black'
                                : currentBgMode === 'light'
                                ? 'bg-white'
                                : 'bg-kith-subBg'
                            }`}
                          >
                            {setting.url ? (
                              <img
                                src={setting.url}
                                alt={setting.name || key}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-xs font-mono text-kith-muted uppercase">No Image Uploaded</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-kith-muted uppercase font-bold">
                            ASSET TITLE / LABEL
                          </label>
                          <input
                            type="text"
                            value={setting.name || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSiteSettingsMap((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], name: val },
                              }));
                            }}
                            className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone"
                            placeholder="Human readable asset name"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-kith-muted uppercase font-bold">
                            IMAGE URL / BASE64 DATA
                          </label>
                          <input
                            type="text"
                            value={setting.url || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSiteSettingsMap((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], url: val },
                              }));
                            }}
                            className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone"
                            placeholder="https://... or /logo.png"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-kith-muted uppercase block font-bold">
                            UPLOAD NEW IMAGE FILE
                          </label>
                          <label className="w-full py-2 px-3 bg-kith-subBg border border-kith-border hover:border-sara-red text-kith-bone text-xs font-mono uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-sara-red dark:text-red-400" />
                            <span>SELECT FILE FROM COMPUTER</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleAssetFileUpload(key, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-kith-border">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            handleSaveSiteSetting(
                              key,
                              setting.name || key,
                              setting.url || '',
                              setting.category || 'branding',
                              setting.alt_text
                            )
                          }
                          className="w-full py-2.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SAVING ASSET...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> SAVE ASSET
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Section 2: Company Information & About Us Content */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold font-mono text-kith-bone uppercase border-b border-kith-border pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sara-red dark:text-red-400" />
              2. ABOUT US, MISSION & COMPANY CAPACITY METRICS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(siteSettingsMap)
                .filter(([_, s]) => s.category === 'company' || s.category === 'about')
                .map(([key, setting]) => {
                  const isSaving = savingSettingKey === key;
                  const isLongText = key.includes('mission') || key.includes('overview') || key.includes('vision');

                  return (
                    <div
                      key={key}
                      className="bg-kith-card border border-kith-border p-5 rounded-sm space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-kith-border pb-3">
                          <span className="font-mono text-xs font-bold text-kith-bone uppercase tracking-wider">
                            {setting.name || key}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-kith-subBg border border-kith-border text-kith-muted uppercase">
                            {setting.category}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-kith-muted uppercase font-bold">
                            SETTING VALUE / TEXT CONTENT
                          </label>
                          {isLongText ? (
                            <textarea
                              rows={4}
                              value={setting.url || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSiteSettingsMap((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], url: val },
                                }));
                              }}
                              className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone leading-relaxed"
                            />
                          ) : (
                            <input
                              type="text"
                              value={setting.url || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSiteSettingsMap((prev) => ({
                                  ...prev,
                                  [key]: { ...prev[key], url: val },
                                }));
                              }}
                              className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone"
                            />
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-kith-border">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            handleSaveSiteSetting(
                              key,
                              setting.name || key,
                              setting.url || '',
                              setting.category || 'about',
                              setting.alt_text
                            )
                          }
                          className="w-full py-2.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SAVING TEXT...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> SAVE SETTING
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Section 3: Contact Details & Office Address */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold font-mono text-kith-bone uppercase border-b border-kith-border pb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-sara-red dark:text-red-400" />
              3. CONTACT DETAILS, ADDRESS & OPERATING HOURS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(siteSettingsMap)
                .filter(([_, s]) => s.category === 'contact')
                .map(([key, setting]) => {
                  const isSaving = savingSettingKey === key;

                  return (
                    <div
                      key={key}
                      className="bg-kith-card border border-kith-border p-5 rounded-sm space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-kith-border pb-3">
                          <span className="font-mono text-xs font-bold text-kith-bone uppercase tracking-wider">
                            {setting.name || key}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-kith-subBg border border-kith-border text-kith-muted uppercase">
                            contact
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-kith-muted uppercase font-bold">
                            SETTING VALUE / DETAIL
                          </label>
                          <input
                            type="text"
                            value={setting.url || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSiteSettingsMap((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], url: val },
                              }));
                            }}
                            className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-kith-border">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            handleSaveSiteSetting(
                              key,
                              setting.name || key,
                              setting.url || '',
                              'contact',
                              setting.alt_text
                            )
                          }
                          className="w-full py-2.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SAVING DETAIL...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> SAVE SETTING
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Section 4: Social Media Links (Telegram, Instagram, TikTok, LinkedIn) */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold font-mono text-kith-bone uppercase border-b border-kith-border pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sara-red dark:text-red-400" />
              4. SOCIAL MEDIA PLATFORMS (TELEGRAM, INSTAGRAM, TIKTOK, LINKEDIN)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(siteSettingsMap)
                .filter(([_, s]) => s.category === 'social')
                .map(([key, setting]) => {
                  const isSaving = savingSettingKey === key;

                  return (
                    <div
                      key={key}
                      className="bg-kith-card border border-kith-border p-5 rounded-sm space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-kith-border pb-3">
                          <span className="font-mono text-xs font-bold text-kith-bone uppercase tracking-wider">
                            {setting.name || key}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-sara-red/10 border border-sara-red/30 text-sara-red dark:text-red-400 uppercase font-bold">
                            social
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-kith-muted uppercase font-bold">
                            TARGET PLATFORM URL
                          </label>
                          <input
                            type="text"
                            value={setting.url || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSiteSettingsMap((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], url: val },
                              }));
                            }}
                            className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-kith-border">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            handleSaveSiteSetting(
                              key,
                              setting.name || key,
                              setting.url || '',
                              'social',
                              setting.alt_text
                            )
                          }
                          className="w-full py-2.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SAVING LINK...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> SAVE SOCIAL LINK
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-kith-card border border-kith-border p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-kith-border pb-4">
              <h2 className="text-xl font-extrabold uppercase text-kith-bone tracking-tight flex items-center gap-2 font-mono">
                {editingProductId ? (
                  <>
                    <Edit className="w-5 h-5 text-sky-400" /> EDIT EQUIPMENT ITEM
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-amber-500" /> ADD NEW EQUIPMENT ITEM
                  </>
                )}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-kith-muted hover:text-kith-bone"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-kith-muted">EQUIPMENT NAME *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Must 5.5kW Hybrid Solar Inverter"
                  className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none focus:border-kith-bone"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-kith-muted">CATEGORY *</label>
                  <select
                    value={prodCategorySlug}
                    onChange={(e) => setProdCategorySlug(e.target.value)}
                    className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none focus:border-kith-bone uppercase"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SKU & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-kith-muted">SKU CODE</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="e.g. SEB-INV-5500"
                    className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none focus:border-kith-bone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-kith-muted">STOCK STATUS</label>
                  <select
                    value={prodStockStatus}
                    onChange={(e) => setProdStockStatus(e.target.value as StockStatus)}
                    className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none focus:border-kith-bone uppercase"
                  >
                    <option value="in_stock">IN STOCK</option>
                    <option value="low_stock">LOW STOCK</option>
                    <option value="preorder">PRE-ORDER</option>
                    <option value="sold_out">SOLD OUT</option>
                  </select>
                </div>
              </div>

              {/* Overview / Description */}
              <div className="space-y-1 border-t border-kith-border pt-4">
                <label className="text-[10px] uppercase text-kith-muted font-bold">
                  OVERVIEW / PRODUCT DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Detailed product technical overview (e.g. Wall-mounted LiFePO4 solar energy storage pack with built-in smart BMS...)"
                  className="w-full bg-kith-subBg border border-kith-border p-3 text-kith-bone focus:outline-none"
                />
              </div>

              {/* EQUIPMENT TECHNICAL SPECIFICATIONS MATRIX */}
              <div className="space-y-3 border-t border-kith-border pt-4">
                <label className="text-[10px] uppercase text-sara-red dark:text-red-400 font-bold tracking-widest block">
                  EQUIPMENT TECHNICAL SPECIFICATIONS MATRIX
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-kith-muted">1. Brand</label>
                    <input
                      type="text"
                      value={specBrand}
                      onChange={(e) => setSpecBrand(e.target.value)}
                      placeholder="e.g. Felicity Solar / Jinko / Must"
                      className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-kith-muted">2. Capacity / Power</label>
                    <input
                      type="text"
                      value={specCapacity}
                      onChange={(e) => setSpecCapacity(e.target.value)}
                      placeholder="e.g. 100Ah / 5.12 kWh or 550W TOPCon"
                      className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-kith-muted">3. Voltage</label>
                    <input
                      type="text"
                      value={specVoltage}
                      onChange={(e) => setSpecVoltage(e.target.value)}
                      placeholder="e.g. 51.2V Nominal / 48VDC / 230VAC"
                      className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-kith-muted">4. Weight</label>
                    <input
                      type="text"
                      value={specWeight}
                      onChange={(e) => setSpecWeight(e.target.value)}
                      placeholder="e.g. 48 kg / 28 kg"
                      className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] uppercase text-kith-muted">5. Warranty</label>
                    <input
                      type="text"
                      value={specWarranty}
                      onChange={(e) => setSpecWarranty(e.target.value)}
                      placeholder="e.g. 5-Year Manufacturer Warranty / 6000+ Cycles"
                      className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Availability */}
              <div className="space-y-1 border-t border-kith-border pt-4">
                <label className="text-[10px] uppercase text-kith-bone font-bold block">
                  AVAILABILITY OF DELIVERY
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={deliveryAvailable}
                    onChange={(e) => setDeliveryAvailable(e.target.value)}
                    placeholder="e.g. Addis Ababa Delivery Available"
                    className="flex-1 bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone"
                  />
                  <select
                    onChange={(e) => setDeliveryAvailable(e.target.value)}
                    className="bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone uppercase text-[10px]"
                    defaultValue=""
                  >
                    <option value="" disabled>Quick Options</option>
                    <option value="Addis Ababa Delivery Available">Addis Ababa Delivery Available</option>
                    <option value="Addis Ababa & Regional Shipping">Addis Ababa & Regional Shipping</option>
                    <option value="Nationwide Logistics Available">Nationwide Logistics Available</option>
                    <option value="In-Store Pickup Only">In-Store Pickup Only</option>
                  </select>
                </div>
              </div>

              {/* MULTIPLE IMAGES SECTION */}
              <div className="space-y-3 border-t border-kith-border pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase text-kith-bone font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    PRODUCT PHOTOS (MULTIPLE ALLOWED) - RECOMMENDED SIZE: 800 x 800px (1:1 Ratio)
                  </label>
                  <span className="text-[10px] text-kith-muted">{prodImageUrls.length} photo(s)</span>
                </div>

                {/* Upload Multiple Files */}
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-kith-subBg border border-kith-border hover:border-kith-bone cursor-pointer text-kith-bone flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>{uploadingImage ? 'Uploading Photos...' : 'Upload Photos (Select Multiple)'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleFilesUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Manual URL Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    placeholder="Or paste an Image URL..."
                    className="flex-1 bg-kith-subBg border border-kith-border px-3 py-2 text-kith-bone"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="px-4 py-2 border border-kith-border bg-kith-card text-kith-bone hover:border-kith-bone uppercase text-[10px] tracking-wider"
                  >
                    + ADD URL
                  </button>
                </div>

                {/* GALLERY THUMBNAILS PREVIEW */}
                {prodImageUrls.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {prodImageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group w-full aspect-square border border-kith-border bg-kith-subBg overflow-hidden"
                      >
                        <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/80 text-rose-400 hover:text-rose-200 transition-colors opacity-90 group-hover:opacity-100"
                          title="Remove Photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-amber-500 text-black text-[8px] font-bold text-center uppercase py-0.5">
                            MAIN
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1 border-t border-kith-border pt-4">
                <label className="text-[10px] uppercase text-kith-muted">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Detailed product technical overview..."
                  className="w-full bg-kith-subBg border border-kith-border p-3 text-kith-bone focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-kith-border">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-kith-border text-kith-muted hover:text-kith-bone"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-6 py-2.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg"
                >
                  {submitting ? 'SAVING...' : editingProductId ? 'UPDATE PRODUCT' : 'SAVE PRODUCT & GALLERY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-kith-card border border-kith-border p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-kith-border pb-4">
              <h2 className="text-lg font-extrabold uppercase text-kith-bone tracking-tight font-mono flex items-center gap-2">
                {editingCategoryId ? <Edit className="w-4 h-4 text-sky-400" /> : <Plus className="w-4 h-4 text-amber-500" />}
                {editingCategoryId ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 text-kith-muted hover:text-kith-bone">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-kith-muted">CATEGORY NAME *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Solar Generators & UPS"
                  className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none focus:border-kith-bone"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-kith-muted">SLUG (URL KEY)</label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="e.g. solar-generators"
                    className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-kith-muted">DISPLAY ORDER</label>
                  <input
                    type="number"
                    value={catDisplayOrder}
                    onChange={(e) => setCatDisplayOrder(Number(e.target.value))}
                    className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-kith-muted">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Brief description of items in this category..."
                  className="w-full bg-kith-subBg border border-kith-border p-3 text-kith-bone focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-kith-border">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 border border-kith-border text-kith-muted hover:text-kith-bone"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover uppercase tracking-widest font-bold shadow-lg"
                >
                  {submitting ? 'SAVING...' : editingCategoryId ? 'UPDATE CATEGORY' : 'SAVE CATEGORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SERVICE CREATE / EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-kith-card border border-kith-border p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-kith-border pb-4">
              <h2 className="text-lg font-extrabold uppercase text-kith-bone tracking-tight font-mono flex items-center gap-2">
                {editingServiceId ? <Edit className="w-4 h-4 text-sky-400" /> : <Plus className="w-4 h-4 text-amber-500" />}
                {editingServiceId ? 'EDIT SERVICE' : 'ADD TECHNICAL SERVICE'}
              </h2>
              <button onClick={() => setIsServiceModalOpen(false)} className="p-1 text-kith-muted hover:text-kith-bone">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-kith-muted">SERVICE TITLE *</label>
                <input
                  type="text"
                  required
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  placeholder="e.g. Commercial Solar Installation"
                  className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none focus:border-kith-bone"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-kith-muted">PRICE RANGE TAG</label>
                  <input
                    type="text"
                    value={srvPriceRange}
                    onChange={(e) => setSrvPriceRange(e.target.value)}
                    placeholder="e.g. Custom Quote / From 15,000 ETB"
                    className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-kith-muted">SUBTITLE</label>
                  <input
                    type="text"
                    value={srvSubtitle}
                    onChange={(e) => setSrvSubtitle(e.target.value)}
                    placeholder="Short summary tagline..."
                    className="w-full bg-kith-subBg border border-kith-border px-3 py-2.5 text-kith-bone focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-kith-muted">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={srvDescription}
                  onChange={(e) => setSrvDescription(e.target.value)}
                  placeholder="Complete service offering overview..."
                  className="w-full bg-kith-subBg border border-kith-border p-3 text-kith-bone focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-kith-muted">
                  SCOPE OF WORK / SPECIFICATIONS (1 PER LINE)
                </label>
                <textarea
                  rows={3}
                  value={srvSpecsText}
                  onChange={(e) => setSrvSpecsText(e.target.value)}
                  placeholder="Site Survey & Load Sizing&#10;Inverter Commissioning&#10;Battery Health Diagnostics"
                  className="w-full bg-kith-subBg border border-kith-border p-3 text-kith-bone focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-kith-border">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-5 py-2.5 border border-kith-border text-kith-muted hover:text-kith-bone"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover uppercase tracking-widest font-bold shadow-lg"
                >
                  {submitting ? 'SAVING...' : editingServiceId ? 'UPDATE SERVICE' : 'SAVE SERVICE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
