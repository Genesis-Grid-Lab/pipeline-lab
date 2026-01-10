
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import {
    Layers,
    Search,
    Plus,
    Grid3X3,
    List,
    Upload,
    FolderOpen,
    Image,
    Music,
    Box,
    FileCode,
    Settings,
    LogOut,
    User,
    MoreVertical,
    Trash2,
    Edit,
    Download,
    X,
    Loader2,
    LayoutDashboard,
    ChevronDown,
    Filter
} from "lucide-react";

const ASSET_TYPES = [
    {
        value: "sprite", label: "Sprite", icon: <Image className="w-4 h-4" />, color: "text-green-500"
    },
    {
        value: "texture", label: "Texture", icon: <Layers className="w-4 h-4" />, color: "text-amber-500"
    },
    {
        value: "icon", label: "Icon", icon: <FileCode className="w-4 h-4" />, color: "text-purple-500"
    },
    {
        value: "audio", label: "Audio", icon: <Music className="w-4 h-4" />, color: "text-blue-500"
    },
    { value: "model_3d", label: "3D Model", icon: <Box className="w-4 h-4" />, color: "text-pink-500" }
];

const getAssetTypeInfo = (type) => {
    return ASSET_TYPES.find(t => t.value === type) || ASSET_TYPES[0];
};

const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Dashboard = ({ user, api }) => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterCollection, setFilterCollection] = useState("all");
    const [assets, setAssets] = useState([]);
    const [collections, setCollections] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Upload dialog state
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadData, setUploadData] = useState({
        name: "",
        description: "",
        asset_type: "sprite",
        tags: "",
        collection_id: ""
    });

    // Collection dialog state
    const [collectionOpen, setCollectionOpen] = useState(false);
    const [collectionLoading, setCollectionLoading] = useState(false);
    const [collectionData, setCollectionData] = useState({
        name: "",
        description: "",
        color: "#3B82F6"
    });

    // Fetch data
    const fetchAssets = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);
            if (filterType !== "all") params.append("asset_type", filterType);
            if (filterCollection !== "all") params.append("collection_id", filterCollection);

            const response = await api.get(`/assets?${params.toString()}`);
            setAssets(response.data);
        } catch (error) {
            toast.error("Failed to load assets");
        }
    }, [api, searchQuery, filterType, filterCollection]);

    const fetchCollections = useCallback(async () => {
        try {
            const response = await api.get("/collections");
            setCollections(response.data);
        } catch (error) {
            toast.error("Failed to load collections");
        }
    }, [api]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get("/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    }, [api]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchAssets(), fetchCollections(), fetchStats()]);
            setLoading(false);
        };
        loadData();
    }, [fetchAssets, fetchCollections, fetchStats]);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAssets();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filterType, filterCollection, fetchAssets]);

    // Handle file upload
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            if (!uploadData.name) {
                setUploadData({ ...uploadData, name: file.name.split('.')[0] });
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.name) {
            toast.error("Please enter an asset name");
            return;
        }

        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", uploadData.name);
            formData.append("asset_type", uploadData.asset_type);
            formData.append("description", uploadData.description);
            formData.append("tags", uploadData.tags);
            if (uploadData.collection_id) {
                formData.append("collection_id", uploadData.collection_id);
            }
            if (uploadFile) {
                formData.append("file", uploadFile);
            }

            await api.post("/assets", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            toast.success("Asset uploaded successfully");
            setUploadOpen(false);
            setUploadFile(null);
            setUploadData({
                name: "",
                description: "",
                asset_type: "sprite",
                tags: "",
                collection_id: ""
            });
            fetchAssets();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Upload failed");
        } finally {
            setUploadLoading(false);
        }
    };

    // Handle collection create
    const handleCreateCollection = async (e) => {
        e.preventDefault();
        if (!collectionData.name) {
            toast.error("Please enter a collection name");
            return;
        }

        setCollectionLoading(true);
        try {
            await api.post("/collections", collectionData);
            toast.success("Collection created");
            setCollectionOpen(false);
            setCollectionData({
                name: "", description: "", color: "#3B82F6"
            });
            fetchCollections();
            fetchStats();
        } catch (error) {
            toast.error("Failed to create collection");
        } finally {
            setCollectionLoading(false);
        }
    };

    // Handle delete asset
    const handleDeleteAsset = async (assetId) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;

        try {
            await api.delete(`/assets/${assetId}`);
            toast.success("Asset deleted");
            fetchAssets();
            fetchStats();
        } catch (error) {
            toast.error("Failed to delete asset");
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            // Ignore logout errors
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-background flex" data-testid="dashboard">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card h-screen sticky top-0 flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b border-border">
                    < Link to="/dashboard" className="flex items-center gap-2" data-testid="sidebar-logo">
                        < div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            < Layers className="w-5 h-5 text-white" />
                        </div >
                        <span className="font-bold text-lg">Asset Forge</span>
                    </Link >
                </div >

                <ScrollArea className="flex-1 p-4">
                    {/* Main Navigation */}
                    <nav className="space-y-1 mb-6">
                        < Link
                            to="/dashboard"
                            className="sidebar-link active"
                            data-testid="nav-dashboard"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            < span > Dashboard</span >
                        </Link >
                    </nav >

                    {/* Collections */}
                    < div className="mb-6">
                        < div className="flex items-center justify-between mb-2">
                            < span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Collections
                            </span >
                            <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" data-testid="new-collection-btn">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>New Collection</DialogTitle>
                                        <DialogDescription>Create a new collection to organize your assets.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateCollection}>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="col-name">Name</Label>
                                                <Input
                                                    id="col-name"
                                                    value={collectionData.name}
                                                    onChange={(e) => setCollectionData({ ...collectionData, name: e.target.value })}
                                                    placeholder="My Collection"
                                                    data-testid="collection-name-input"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                < Label htmlFor="col-desc">Description</Label>
                                                < Textarea
                                                    id="col-desc"
                                                    value={collectionData.description}
                                                    onChange={(e) => setCollectionData({ ...collectionData, description: e.target.value })}
                                                    placeholder="Optional description"
                                                    data-testid="collection-desc-input"
                                                />
                                            </div >
                                            <div className="space-y-2">
                                                < Label htmlFor="col-color">Color</Label>
                                                < div className="flex gap-2">
                                                    {
                                                        ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"].map((color) => (
                                                            < button
                                                                key={color}
                                                                type="button"
                                                                className={`w-8 h-8 rounded-lg border-2 transition-all ${collectionData.color === color ? "border-foreground scale-110" : "border-transparent"
                                                                    } `}
                                                                style={{ backgroundColor: color }}
                                                                onClick={() => setCollectionData({ ...collectionData, color })}
                                                            />
                                                        ))}
                                                </div>
                                            </div >
                                        </div >
                                        <DialogFooter>
                                            <Button type="submit" disabled={collectionLoading} data-testid="create-collection-submit">
                                                {collectionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                                Create
                                            </Button>
                                        </DialogFooter >
                                    </form >
                                </DialogContent >
                            </Dialog >
                        </div >
                        <nav className="space-y-1">
                            < button
                                onClick={() => setFilterCollection("all")}
                                className={`sidebar - link w - full text - left ${filterCollection === "all" ? "active" : ""}`}
                                data-testid="filter-all-collections"
                            >
                                <FolderOpen className="w-5 h-5" />
                                < span > All Assets</span >
                            </button >
                            {
                                collections.map((col) => (
                                    <button
                                        key={col.collection_id}
                                        onClick={() => setFilterCollection(col.collection_id)}
                                        className={`sidebar-link w-full text-left ${filterCollection === col.collection_id ? "active" : ""}`}
                                        data-testid={`collection-${col.collection_id}`}
                                    >
                                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: col.color }}>
                                            < FolderOpen className="w-3 h-3 text-white" />
                                        </div >
                                        <span className="truncate flex-1">{col.name}</span>
                                        < Badge variant="secondary" className="ml-auto text-xs">
                                            {col.asset_count || 0}
                                        </Badge >
                                    </button >
                                ))
                            }
                        </nav >
                    </div >

                    {/* Asset Types Filter */}
                    < div >
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                            Asset Types
                        </span >
                        <nav className="space-y-1">
                            < button
                                onClick={() => setFilterType("all")}
                                className={`sidebar-link w-full text-left ${filterType === "all" ? "active" : ""}`}
                                data-testid="filter-type-all"
                            >
                                <Grid3X3 className="w-5 h-5" />
                                < span > All Types</span >
                            </button >
                            {
                                ASSET_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setFilterType(type.value)}
                                        className={`sidebar-link w-full text-left ${filterType === type.value ? "active" : ""}`}
                                        data-testid={`filter-type-${type.value}`}
                                    >
                                        <span className={type.color}>{type.icon}</span>
                                        <span>{type.label}</span>
                                    </button >
                                ))}
                        </nav >
                    </div >
                </ScrollArea >

                {/* User Section */}
                < div className="p-4 border-t border-border" >
                    < DropdownMenu >
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors" data-testid="user-menu-trigger">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    {user?.picture ? (
                                        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <User className="w-4 h-4 text-primary" />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    < p className="text-sm font-medium truncate">{user?.name}</p>
                                    < p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div >
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button >
                        </DropdownMenuTrigger >
                        <DropdownMenuContent align="end" className="w-56">
                            < DropdownMenuItem data-testid="user-settings">
                                < Settings className="w-4 h-4 mr-2" />
                                Settings
                            </DropdownMenuItem >
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="logout-btn">
                                < LogOut className="w-4 h-4 mr-2" />
                                Log Out
                            </DropdownMenuItem >
                        </DropdownMenuContent >
                    </DropdownMenu >
                </div >
            </aside >

            {/* Main Content */}
            < main className="flex-1 flex flex-col min-h-screen" >
                {/* Top Bar */}
                < header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-center px-6 gap-4" >
                    < div className="flex-1 max-w-xl">
                        < div className="relative">
                            < Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            < Input
                                placeholder="Search assets..."
                                className="pl-10 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="search-input"
                            />
                        </div >
                    </div >

                    <div className="flex items-center gap-2">
                        < div className="flex items-center border border-border rounded-lg overflow-hidden">
                            < Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="icon"
                                className="rounded-none"
                                onClick={() => setViewMode("grid")}
                                data-testid="view-grid-btn"
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button >
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="icon"
                                className="rounded-none"
                                onClick={() => setViewMode("list")}
                                data-testid="view-list-btn"
                            >
                                <List className="w-4 h-4" />
                            </Button >
                        </div >

                        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                            <DialogTrigger asChild>
                                <Button data-testid="upload-btn">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Upload Asset
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                < DialogHeader >
                                    <DialogTitle>Upload Asset</DialogTitle>
                                    <DialogDescription>Add a new asset to your library.</DialogDescription>
                                </DialogHeader >
                                <form onSubmit={handleUpload}>
                                    <div className="space-y-4 py-4">
                                        {/* File Upload Zone */}
                                        <div
                                            className={`upload-zone py-10 px-6 text-center cursor-pointer ${uploadFile ? "border-primary bg-primary/5" : ""}`}
                                            onClick={() => document.getElementById("file-input").click()}
                                        >
                                            {uploadFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                                        <Upload className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div className="text-left">
                                                        < p className="font-medium">{uploadFile.name}</p>
                                                        < p className="text-sm text-muted-foreground">{formatFileSize(uploadFile.size)}</p>
                                                    </div >
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button >
                                                </div >
                                            ) : (
                                                <>
                                                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                                    <p className="font-medium">Click to upload or drag and drop</p >
                                                    <p className="text-sm text-muted-foreground">Images, Audio, or 3D files</p>
                                                </>
                                            )}
                                            <input
                                                id="file-input"
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                                accept="image/*,audio/*,.obj,.fbx,.gltf,.glb"
                                                data-testid="file-input"
                                            />
                                        </div >

                                        <div className="space-y-2">
                                            < Label htmlFor="asset-name">Name *</Label>
                                            < Input
                                                id="asset-name"
                                                value={uploadData.name}
                                                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                                                placeholder="Asset name"
                                                data-testid="asset-name-input"
                                            />
                                        </div >

                                        <div className="grid grid-cols-2 gap-4">
                                            < div className="space-y-2">
                                                < Label htmlFor="asset-type">Type *</Label>
                                                < Select
                                                    value={uploadData.asset_type}
                                                    onValueChange={(value) => setUploadData({ ...uploadData, asset_type: value })}
                                                >
                                                    <SelectTrigger data-testid="asset-type-select">
                                                        < SelectValue />
                                                    </SelectTrigger >
                                                    <SelectContent>
                                                        {ASSET_TYPES.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={type.color}>{type.icon}</span>
                                                                    {type.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent >
                                                </Select >
                                            </div >

                                            <div className="space-y-2">
                                                < Label htmlFor="asset-collection">Collection</Label>
                                                < Select
                                                    value={uploadData.collection_id}
                                                    onValueChange={(value) => setUploadData({ ...uploadData, collection_id: value })}
                                                >
                                                    <SelectTrigger data-testid="asset-collection-select">
                                                        < SelectValue placeholder="None" />
                                                    </SelectTrigger >
                                                    <SelectContent>
                                                        <SelectItem value="">None</SelectItem>
                                                        {
                                                            collections.map((col) => (
                                                                <SelectItem key={col.collection_id} value={col.collection_id}>
                                                                    {col.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent >
                                                </Select >
                                            </div >
                                        </div >

                                        <div className="space-y-2">
                                            < Label htmlFor="asset-tags">Tags (comma separated)</Label>
                                            < Input
                                                id="asset-tags"
                                                value={uploadData.tags}
                                                onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                                                placeholder="player, character, sprite"
                                                data-testid="asset-tags-input"
                                            />
                                        </div >

                                        <div className="space-y-2">
                                            < Label htmlFor="asset-desc">Description</Label>
                                            < Textarea
                                                id="asset-desc"
                                                value={uploadData.description}
                                                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                                placeholder="Optional description"
                                                data-testid="asset-desc-input"
                                            />
                                        </div >
                                    </div >
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={uploadLoading} data-testid="upload-submit-btn">
                                            {
                                                uploadLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Upload
                                        </Button >
                                    </DialogFooter >
                                </form >
                            </DialogContent >
                        </Dialog >
                    </div >
                </header >

                {/* Stats */}
                {
                    stats && (
                        <div className="px-6 py-4 border-b border-border bg-card/30">
                            < div className="flex gap-6 text-sm">
                                < div >
                                    <span className="text-muted-foreground">Total Assets:</span>{" "}
                                    < span className="font-semibold">{stats.total_assets}</span>
                                </div >
                                <div>
                                    <span className="text-muted-foreground">Collections:</span>{
                                        " "}
                                    < span className="font-semibold">{stats.total_collections}</span>
                                </div >
                                <div>
                                    <span className="text-muted-foreground">Storage:</span>{
                                        " "}
                                    < span className="font-semibold">{formatFileSize(stats.total_storage_bytes)}</span>
                                </div >
                            </div >
                        </div >
                    )
                }

                {/* Content */}
                <div className="flex-1 p-6">
                    {
                        loading ? (
                            <div className="flex items-center justify-center h-64">
                                < Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div >
                        ) : assets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                < div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    < FolderOpen className="w-8 h-8 text-muted-foreground" />
                                </div >
                                <h3 className="font-semibold text-lg mb-1">No assets yet</h3>
                                < p className="text-muted-foreground mb-4">Upload your first asset to get started</p>
                                < Button onClick={() => setUploadOpen(true)
                                } data-testid="empty-upload-btn">
                                    < Plus className="w-4 h-4 mr-2" />
                                    Upload Asset
                                </Button >
                            </div >
                        ) : viewMode === "grid" ? (
                            < div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="assets-grid">
                                {
                                    assets.map((asset) => {
                                        const typeInfo = getAssetTypeInfo(asset.asset_type);
                                        return (
                                            <div
                                                key={asset.asset_id}
                                                className="asset-card group cursor-pointer"
                                                onClick={() => navigate(`/asset/${asset.asset_id}`)
                                                }
                                                data-testid={`asset-card-${asset.asset_id}`
                                                }
                                            >
                                                {/* Preview */}
                                                < div className="aspect-square bg-muted relative overflow-hidden" >
                                                    {
                                                        asset.mime_type?.startsWith("image/") ? (
                                                            < div className="w-full h-full flex items-center justify-center file-preview">
                                                                < span className={`${typeInfo.color}`}>
                                                                    {typeInfo.icon}
                                                                </span >
                                                            </div >
                                                        ) : asset.asset_type === "audio" ? (
                                                            < div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/30">
                                                                < Music className="w-12 h-12 text-blue-500" />
                                                            </div >
                                                        ) : asset.asset_type === "model_3d" ? (
                                                            < div className="w-full h-full flex items-center justify-center bg-pink-50 dark:bg-pink-950/30">
                                                                < Box className="w-12 h-12 text-pink-500" />
                                                            </div >
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                < span className={`${typeInfo.color}`
                                                                }>
                                                                    {
                                                                        React.cloneElement(typeInfo.icon, {
                                                                            className: "w-12 h-12"
                                                                        })}
                                                                </span>
                                                            </div >
                                                        )
                                                    }

                                                    {/* Type Badge */}
                                                    < Badge
                                                        variant="secondary"
                                                        className="absolute top-2 left-2 text-xs"
                                                    >
                                                        {typeInfo.label}
                                                    </Badge >

                                                    {/* Hover Actions */}
                                                    < div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        < Button
                                                            size="icon"
                                                            variant="secondary"
                                                            className="h-8 w-8"
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/asset/${asset.asset_id}`); }
                                                            }
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button >
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            className="h-8 w-8"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.asset_id); }
                                                            }
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button >
                                                    </div >
                                                </div >

                                                {/* Info */}
                                                < div className="p-3" >
                                                    < h3 className="font-medium truncate">{asset.name}</h3>
                                                    < div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                                        < span > {formatFileSize(asset.file_size)}</span >
                                                        <span>v{asset.version}</span>
                                                    </div >
                                                    {
                                                        asset.tags?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {
                                                                    asset.tags.slice(0, 2).map((tag) => (
                                                                        <Badge key={tag} variant="outline" className="text-xs py-0">
                                                                            {tag}
                                                                        </Badge >
                                                                    ))
                                                                }
                                                                {
                                                                    asset.tags.length > 2 && (
                                                                        <Badge variant="outline" className="text-xs py-0">
                                                                            + {asset.tags.length - 2}
                                                                        </Badge >
                                                                    )
                                                                }
                                                            </div >
                                                        )
                                                    }
                                                </div >
                                            </div >
                                        );
                                    })}
                            </div >
                        ) : (
                            <div className="space-y-2" data-testid="assets-list">
                                {
                                    assets.map((asset) => {
                                        const typeInfo = getAssetTypeInfo(asset.asset_type);
                                        return (
                                            <div
                                                key={asset.asset_id}
                                                className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/asset/${asset.asset_id}`)
                                                }
                                                data-testid={`asset-row-${asset.asset_id}`
                                                }
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted ${typeInfo.color}`}>
                                                    {typeInfo.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    < h3 className="font-medium truncate">{asset.name}</h3>
                                                    < p className="text-sm text-muted-foreground truncate">{asset.description || "No description"}</p>
                                                </div >
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    < span > {typeInfo.label}</span >
                                                    <span>{formatFileSize(asset.file_size)}</span>
                                                    <span>v{asset.version}</span>
                                                </div >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        < DropdownMenuItem onClick={() => navigate(`/asset/${asset.asset_id}`)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem >
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.asset_id); }}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem >
                                                    </DropdownMenuContent >
                                                </DropdownMenu >
                                            </div >
                                        );
                                    })}
                            </div >
                        )}
                </div >
            </main >
        </div >
    );
};

export default Dashboard;