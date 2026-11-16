import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, updatePassword } from '@/features/auth/authSlice';
import { updateUserProfile } from '@/features/users/userSlice';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Bell, Calendar, Camera, Download, Loader2, Lock, Settings, Shield, User, Trash2, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormInput, FormTextarea } from '@/components/common/FormFields';
import LoadingState from '@/components/common/LoadingState';
import { capitalize, getAvatar, getInitials } from '@/lib/utils';

const roleVariant = { admin: 'destructive', organizer: 'default', user: 'success' };

const SettingRow = ({ id, title, description, defaultChecked }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border p-4">
    <div>
      <Label htmlFor={id} className="text-sm">{title}</Label>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    <Switch id={id} defaultChecked={defaultChecked} />
  </div>
);

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!user) {
      dispatch(getMe());
    }
  }, [dispatch, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateUserProfile({ id: user._id || user.id, userData: values })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(updatePassword(values)).unwrap();
      toast.success('Password updated successfully!');
      resetForm();
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const profileSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string(),
    bio: Yup.string().max(500, 'Bio cannot exceed 500 characters'),
    address: Yup.object().shape({
      street: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zipCode: Yup.string(),
      country: Yup.string(),
    }),
  });

  const passwordSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  if (loading || !user) {
    return <LoadingState fullPage label="Loading profile..." />;
  }

  const initialProfileValues = {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    address: {
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zipCode: user.address?.zipCode || '',
      country: user.address?.country || '',
    },
  };

  const initialPasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

  return (
    <div className="container py-12">
      <div className="grid items-start gap-8 lg:grid-cols-[19rem_1fr]">
        {/* Summary */}
        <Card className="overflow-hidden lg:sticky lg:top-28">
          <div className="h-24 bg-gradient-to-br from-primary/80 to-[hsl(262_70%_52%)]" />
          <div className="-mt-14 px-6 pb-6 text-center">
            <div className="relative mx-auto h-28 w-28">
              <Avatar className="h-28 w-28 border-4">
                <AvatarImage src={imagePreview || getAvatar(user)} alt={user.name} />
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <label
                className="absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer place-items-center rounded-lg border bg-secondary text-secondary-foreground shadow-soft focus-within:ring-2 focus-within:ring-ring"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change profile photo</span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>
            </div>

            <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
            <p className="break-all text-sm text-muted-foreground">{user.email}</p>
            <Badge variant={roleVariant[user.role] || 'secondary'} className="mt-3">{capitalize(user.role)}</Badge>

            <Separator className="my-5" />
            <ul className="space-y-3 text-left text-sm">
              <li className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Member since</span>
                <span className="ml-auto font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email verified</span>
                <span className="ml-auto font-medium">{user.isEmailVerified ? 'Yes' : 'No'}</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="p-5 sm:p-8">
          <Tabs defaultValue="profile">
            <TabsList className="h-auto w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile"><User /> Profile</TabsTrigger>
              <TabsTrigger value="password"><Lock /> Password</TabsTrigger>
              <TabsTrigger value="notifications"><Bell /> Notifications</TabsTrigger>
              <TabsTrigger value="settings"><Settings /> Settings</TabsTrigger>
            </TabsList>

            {/* Profile */}
            <TabsContent value="profile">
              <Formik initialValues={initialProfileValues} validationSchema={profileSchema} onSubmit={handleProfileSubmit}>
                {({ isSubmitting }) => (
                  <Form className="space-y-5" noValidate>
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormInput name="name" label="Full name" required />
                      <FormInput name="email" type="email" label="Email" required />
                    </div>
                    <FormInput name="phone" type="tel" label="Phone number" />
                    <FormTextarea name="bio" label="Bio" rows={3} placeholder="Tell us about yourself..." />

                    <h2 className="pt-2 text-lg font-bold">Address</h2>
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormInput name="address.street" label="Street" />
                      <FormInput name="address.city" label="City" />
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                      <FormInput name="address.state" label="State" />
                      <FormInput name="address.zipCode" label="ZIP code" />
                      <FormInput name="address.country" label="Country" />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (<><Loader2 className="animate-spin" /> Saving...</>) : 'Save changes'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </TabsContent>

            {/* Password */}
            <TabsContent value="password">
              <Formik initialValues={initialPasswordValues} validationSchema={passwordSchema} onSubmit={handlePasswordSubmit}>
                {({ isSubmitting }) => (
                  <Form className="max-w-lg space-y-5" noValidate>
                    <Alert variant="info">
                      <Info />
                      <AlertTitle>Password requirements</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc space-y-0.5 pl-4">
                          <li>At least 6 characters long</li>
                          <li>Include uppercase and lowercase letters</li>
                          <li>Include at least one number</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    <FormInput name="currentPassword" type="password" label="Current password" required autoComplete="current-password" />
                    <FormInput name="newPassword" type="password" label="New password" required autoComplete="new-password" />
                    <FormInput name="confirmPassword" type="password" label="Confirm new password" required autoComplete="new-password" />
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (<><Loader2 className="animate-spin" /> Updating...</>) : 'Update password'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <h2 className="text-lg font-bold">Notification preferences</h2>
              <div className="space-y-3">
                <SettingRow
                  id="emailNotifications"
                  title="Email notifications"
                  description="Booking confirmations and event updates."
                  defaultChecked={user.preferences?.notifications?.email !== false}
                />
                <SettingRow
                  id="pushNotifications"
                  title="Push notifications"
                  description="Real-time alerts in your browser."
                  defaultChecked={user.preferences?.notifications?.push !== false}
                />
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Event categories</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {['Music', 'Sports', 'Conference', 'Workshop', 'Festival', 'Networking'].map((category) => (
                    <div key={category} className="flex items-center gap-3 rounded-2xl border p-3.5">
                      <Checkbox
                        id={`cat-${category.toLowerCase()}`}
                        defaultChecked={user.preferences?.categories?.includes(category.toLowerCase())}
                      />
                      <Label htmlFor={`cat-${category.toLowerCase()}`} className="flex-1 cursor-pointer font-medium">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save preferences</Button>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-8">
              <h2 className="text-lg font-bold">Account settings</h2>

              <section>
                <h3 className="mb-3 font-semibold">Privacy</h3>
                <SettingRow id="publicProfile" title="Make profile public" description="Let other attendees see your profile." defaultChecked />
              </section>

              <section>
                <h3 className="mb-1 font-semibold">Data export</h3>
                <p className="mb-3 text-sm text-muted-foreground">Download all your personal data in JSON format.</p>
                <Button variant="outline" size="sm"><Download /> Export data</Button>
              </section>

              <section>
                <h3 className="mb-3 font-semibold text-destructive">Danger zone</h3>
                <Alert variant="destructive">
                  <Trash2 />
                  <AlertDescription>
                    <p className="mb-3">Once you delete your account, there is no going back. Please be certain.</p>
                    <Button variant="destructive" size="sm">Delete account</Button>
                  </AlertDescription>
                </Alert>
              </section>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
