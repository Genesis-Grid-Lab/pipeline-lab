import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LoginPage = ({ api }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/auth/login", formData);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            toast.success("Welcome back!");
            navigate("/dashboard", { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        const redirectUrl = window.location.origin + '/dashboard';
        window.location.href = ``;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8" data-testid="login-logo">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-16 h-16 text-blue-300" fill="currentColor" aria-hidden="true">
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="12" cy="6" r="3" />
                            <circle cx="12" cy="18" r="3" />
                            <circle cx="18" cy="12" r="3" />
                        </svg>
                    </div>
                    <span className="font-bold text-2xl">Pipeline Lab</span>
                </Link>

                <Card className="border-border shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome Back</CardTitle>
                        <CardDescription>Sign in to access your asset library</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Google Login */}
                        <Button
                            variant="outline"
                            className="w-full mb-6 py-6"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading}
                            data-testid="google-login-btn"
                        >
                            {googleLoading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            Continue with Google
                        </Button>

                        <div className="relative mb-6">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                                or continue with email
                            </span>
                        </div>

                        {/* Email Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        data-testid="login-email-input"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        data-testid="login-password-input"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-6"
                                disabled={loading}
                                data-testid="login-submit-btn"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                Sign In
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
                                Sign up
                            </Link>
                        </p>
                    </CardContent>
                </Card >
            </div >
        </div >
    );
};

export default LoginPage;