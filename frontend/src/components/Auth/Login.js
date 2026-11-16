import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/features/auth/authSlice';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormInput } from '@/components/common/FormFields';
import AuthLayout from '@/components/common/AuthLayout';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const initialValues = { email: '', password: '', remember: false };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const { remember, ...credentials } = values;
    await dispatch(login(credentials));
    setSubmitting(false);
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Log in to manage your bookings and events.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 pr-10">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
          <button
            type="button"
            onClick={() => dispatch(clearError())}
            className="absolute right-3 top-3 rounded-full p-1 hover:bg-destructive/10"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-5" noValidate>
            <FormInput name="email" type="email" label="Email address" placeholder="you@example.com" autoComplete="email" />

            <FormInput
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              rightSlot={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              }
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={values.remember} onCheckedChange={(v) => setFieldValue('remember', !!v)} />
                <Label htmlFor="remember" className="font-medium">Remember me</Label>
              </div>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (<><Loader2 className="animate-spin" /> Signing in...</>) : 'Sign in'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">Sign up</Link>
            </p>
          </Form>
        )}
      </Formik>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        By signing in, you agree to our{' '}
        <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">Terms of Service</Link> and{' '}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
      </p>
    </AuthLayout>
  );
};

export default Login;
