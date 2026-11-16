import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '@/features/auth/authSlice';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormInput, FormSelect, FieldError } from '@/components/common/FormFields';
import AuthLayout from '@/components/common/AuthLayout';

const RegisterPage = () => {
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

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: '',
    terms: false,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    phone: Yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
    terms: Yup.boolean().oneOf([true], 'You need to accept the terms to continue'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const { confirmPassword, terms, ...userData } = values;
    await dispatch(register(userData));
    setSubmitting(false);
  };

  const toggle = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff /> : <Eye />}
    </Button>
  );

  return (
    <AuthLayout wide>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-muted-foreground">Join the community and start booking in minutes.</p>
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
        {({ isSubmitting, values, setFieldValue, setFieldTouched }) => (
          <Form className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="name" label="Full name" placeholder="Your full name" autoComplete="name" />
              <FormInput name="email" type="email" label="Email address" placeholder="you@example.com" autoComplete="email" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a password"
                autoComplete="new-password"
                rightSlot={toggle}
              />
              <FormInput
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                label="Confirm password"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="phone" type="tel" label="Phone number (optional)" placeholder="Your phone number" autoComplete="tel" />
              <FormSelect
                name="role"
                label="Account type"
                hint="Choose Event organizer if you want to create events."
                options={[
                  { value: 'user', label: 'Attendee' },
                  { value: 'organizer', label: 'Event organizer' },
                ]}
              />
            </div>

            <div>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="terms"
                  checked={values.terms}
                  onCheckedChange={(v) => {
                    setFieldValue('terms', !!v);
                    setFieldTouched('terms', true, false);
                  }}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="font-medium leading-snug">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              <FieldError name="terms" />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (<><Loader2 className="animate-spin" /> Creating account...</>) : 'Create account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
          </Form>
        )}
      </Formik>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        By creating an account, you agree to receive email notifications about events and updates.
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
