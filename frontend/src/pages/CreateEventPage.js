import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent } from '@/features/events/eventSlice';
import { Formik, Form, FieldArray, useFormikContext } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import { Calendar, FileText, ImagePlus, Loader2, MapPin, Plus, Settings2, Ticket, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/common/PageHeader';
import { FieldError, FormInput, FormSelect, FormTextarea, inputClassName } from '@/components/common/FormFields';
import { CATEGORY_KEYS, CATEGORIES, getCategory } from '@/lib/categories';
import { CATEGORY_IMAGES } from '@/lib/images';
import { INDORE_VENUES, INDORE_DEFAULT_ADDRESS } from '@/lib/indore';
import { cn, imgFallback } from '@/lib/utils';

const requirementOptions = [
  { value: 'age-18+', label: 'Age 18+' },
  { value: 'id-required', label: 'ID required' },
  { value: 'vaccination', label: 'Vaccination proof' },
  { value: 'dress-code', label: 'Dress code' },
];

const Section = ({ icon: Icon, title, description, children }) => (
  <Card className="p-6 sm:p-8">
    <div className="mb-6 flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
    <div className="space-y-5">{children}</div>
  </Card>
);

const DateField = ({ id, label, required, selected, onChange, error, ...props }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
    <DatePicker id={id} selected={selected} onChange={onChange} className={cn(inputClassName, error && 'border-destructive')} {...props} />
  </div>
);

// When the user presses submit and something is invalid, say so and scroll to it.
// (Otherwise the error can sit far down the page and the button looks "broken".)
const SubmitWatcher = () => {
  const { submitCount, isValid, isSubmitting } = useFormikContext();
  useEffect(() => {
    if (submitCount > 0 && !isValid && !isSubmitting) {
      toast.error('Please fix the highlighted fields');
      setTimeout(() => {
        document.querySelector('[role="alert"], [aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [submitCount]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const atSixPm = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(18, 0, 0, 0);
  return d;
};

const CreateEventPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [tagsText, setTagsText] = React.useState('');
  const statusRef = useRef('published');

  const start = atSixPm(1);
  const initialValues = {
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: ['indore'],
    startDate: start,
    endDate: new Date(start.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
    venue: { name: '', address: { ...INDORE_DEFAULT_ADDRESS } },
    isOnline: false,
    onlineLink: '',
    ticketTypes: [
      {
        name: 'General Admission',
        description: 'Standard entry ticket',
        price: 0,
        quantity: 100,
        salesEndDate: start, // sales close when the event starts
      },
    ],
    maxAttendees: '',
    privacy: 'public',
    requirements: [],
    coverImage: '',
  };

  const isFuture = (v) => !v || new Date(v).getTime() > Date.now();

  const validationSchema = Yup.object({
    title: Yup.string().trim().required('Event title is required').max(100, 'Title cannot exceed 100 characters'),
    description: Yup.string().trim().required('Description is required').max(2000, 'Description cannot exceed 2000 characters'),
    shortDescription: Yup.string().max(200, 'Short description cannot exceed 200 characters'),
    category: Yup.string().required('Please choose a category'),
    startDate: Yup.date().required('Start date is required').test('future', 'Start date must be in the future', isFuture),
    endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after the start date'),
    venue: Yup.object().when('isOnline', {
      is: false,
      then: (schema) => schema.shape({ name: Yup.string().trim().required('Venue name is required') }),
    }),
    onlineLink: Yup.string().when('isOnline', {
      is: true,
      then: (schema) => schema.url('Enter a full link, e.g. https://meet.google.com/abc').required('Online link is required'),
    }),
    coverImage: Yup.string().url('Enter a full image link starting with https://'),
    ticketTypes: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required('Ticket name is required'),
          price: Yup.number().typeError('Enter a number').min(0, 'Price cannot be negative').required('Price is required'),
          quantity: Yup.number().typeError('Enter a number').min(1, 'Quantity must be at least 1').required('Quantity is required'),
        })
      )
      .min(1, 'At least one ticket type is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const status = statusRef.current;
    const payload = {
      ...values,
      status,
      maxAttendees: values.maxAttendees === '' ? undefined : Number(values.maxAttendees),
      ticketTypes: values.ticketTypes.map((t) => ({
        ...t,
        price: Number(t.price),
        quantity: Number(t.quantity),
        salesEndDate: t.salesEndDate || values.startDate,
      })),
      venue: values.isOnline ? { name: 'Online event' } : values.venue,
      images: values.coverImage.trim() ? [{ url: values.coverImage.trim(), isMain: true }] : [],
    };
    delete payload.coverImage;

    try {
      await dispatch(createEvent(payload)).unwrap();
      toast.success(status === 'draft' ? 'Draft saved. An admin needs to approve it.' : 'Event published!');
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/organizer/dashboard');
    } catch (err) {
      // The server's own message (e.g. "Venue name is required") is the useful part
      toast.error(typeof err === 'string' ? err : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-12">
      <PageHeader title="Create new event" description="Host something in Indore. Fill in the details and publish." />

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue, isSubmitting, errors, touched, submitForm }) => (
          <Form className="space-y-6" noValidate>
            <SubmitWatcher />

            {/* Basic information */}
            <Section icon={FileText} title="Basic information" description="What is your event about?">
              <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
                <FormInput name="title" label="Event title" required placeholder="e.g., Sarafa Night Food Walk" />
                <FormSelect
                  name="category"
                  label="Category"
                  required
                  placeholder="Select category"
                  options={CATEGORY_KEYS.map((key) => ({ value: key, label: CATEGORIES[key].label }))}
                />
              </div>
              <FormTextarea name="shortDescription" label="Short description" rows={2} placeholder="One or two lines (max 200 characters)" />
              <FormTextarea name="description" label="Full description" required rows={5} placeholder="Tell people what to expect, what to bring, timings..." />
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tagsText || values.tags.join(', ')}
                  placeholder="e.g., indore, food, nightlife"
                  onChange={(e) => {
                    setTagsText(e.target.value);
                    setFieldValue('tags', e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean));
                  }}
                />
                {values.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {values.tags.map((tag, i) => <Badge key={`${tag}-${i}`} variant="secondary">{tag}</Badge>)}
                  </div>
                )}
              </div>
            </Section>

            {/* Date & time */}
            <Section icon={Calendar} title="Date & time" description="When does it start and end?">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <DateField
                    id="startDate"
                    label="Start date & time"
                    required
                    selected={values.startDate}
                    onChange={(date) => {
                      setFieldValue('startDate', date);
                      // keep the end after the start, and ticket sales ending at the start
                      if (date && values.endDate <= date) setFieldValue('endDate', new Date(date.getTime() + 3 * 60 * 60 * 1000));
                      values.ticketTypes.forEach((_, i) => setFieldValue(`ticketTypes.${i}.salesEndDate`, date));
                    }}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    error={touched.startDate && errors.startDate}
                  />
                  <FieldError name="startDate" />
                </div>
                <div>
                  <DateField
                    id="endDate"
                    label="End date & time"
                    required
                    selected={values.endDate}
                    onChange={(date) => setFieldValue('endDate', date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={values.startDate}
                    error={touched.endDate && errors.endDate}
                  />
                  <FieldError name="endDate" />
                </div>
              </div>
            </Section>

            {/* Location */}
            <Section icon={MapPin} title="Location" description="Where in Indore will people join you?">
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <Switch id="isOnline" checked={values.isOnline} onCheckedChange={(checked) => setFieldValue('isOnline', checked)} />
                <Label htmlFor="isOnline" className="cursor-pointer">This is an online event</Label>
              </div>

              {values.isOnline ? (
                <FormInput name="onlineLink" type="url" label="Online event link" required placeholder="https://meet.google.com/xxx-yyyy-zzz" />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Popular places in Indore</Label>
                    <div className="flex flex-wrap gap-2">
                      {INDORE_VENUES.map((v) => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => {
                            setFieldValue('venue.name', v.name);
                            setFieldValue('venue.address.street', v.area);
                            setFieldValue('venue.address.city', 'Indore');
                            setFieldValue('venue.address.state', 'Madhya Pradesh');
                            setFieldValue('venue.address.country', 'India');
                          }}
                          className={cn(
                            'rounded-lg border px-3 py-1 text-sm font-bold transition-colors',
                            values.venue.name === v.name ? 'bg-secondary text-secondary-foreground' : 'bg-card hover:bg-secondary hover:text-secondary-foreground'
                          )}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FormInput name="venue.name" label="Venue name" required placeholder="Or type your own venue" />
                  <div className="grid gap-5 md:grid-cols-2">
                    <FormInput name="venue.address.street" label="Area / street" placeholder="e.g., Vijay Nagar" />
                    <FormInput name="venue.address.city" label="City" />
                  </div>
                  <div className="grid gap-5 md:grid-cols-3">
                    <FormInput name="venue.address.state" label="State" />
                    <FormInput name="venue.address.zipCode" label="PIN code" placeholder="452001" />
                    <FormInput name="venue.address.country" label="Country" />
                  </div>
                </>
              )}
            </Section>

            {/* Tickets */}
            <Section icon={Ticket} title="Ticket types" description="Set prices and how many passes you want to sell. Price 0 means free entry.">
              <FieldArray name="ticketTypes">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.ticketTypes.map((ticket, index) => (
                      <div key={index} className="rounded-xl border bg-muted/40 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="font-bold">Ticket type {index + 1}</h3>
                          {values.ticketTypes.length > 1 && (
                            <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)} aria-label={`Remove ticket type ${index + 1}`}>
                              <Trash2 />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-5">
                          <div className="grid gap-5 md:grid-cols-2">
                            <FormInput name={`ticketTypes.${index}.name`} label="Ticket name" required placeholder="e.g., General, VIP" />
                            <FormInput name={`ticketTypes.${index}.description`} label="Description" placeholder="What's included" />
                          </div>
                          <div className="grid gap-5 md:grid-cols-3">
                            <FormInput name={`ticketTypes.${index}.price`} type="number" label="Price (₹)" required min="0" step="1" />
                            <FormInput name={`ticketTypes.${index}.quantity`} type="number" label="Quantity" required min="1" />
                            <DateField
                              id={`ticket-sales-${index}`}
                              label="Sales end date"
                              selected={values.ticketTypes[index].salesEndDate}
                              onChange={(date) => setFieldValue(`ticketTypes.${index}.salesEndDate`, date)}
                              showTimeSelect
                              dateFormat="MMMM d, yyyy h:mm aa"
                              minDate={new Date()}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => push({ name: '', description: '', price: 0, quantity: 100, salesEndDate: values.startDate })}
                    >
                      <Plus /> Add another ticket type
                    </Button>
                  </div>
                )}
              </FieldArray>
            </Section>

            {/* Additional settings */}
            <Section icon={Settings2} title="Additional settings">
              <div className="grid gap-5 md:grid-cols-2">
                <FormInput
                  name="maxAttendees"
                  type="number"
                  label="Maximum attendees"
                  placeholder="Leave empty to use total ticket quantity"
                  min="1"
                />
                <FormSelect
                  name="privacy"
                  label="Privacy"
                  options={[
                    { value: 'public', label: 'Public: anyone can see and join' },
                    { value: 'private', label: 'Private: only invited guests' },
                    { value: 'invite-only', label: 'Invite only' },
                  ]}
                />
              </div>

              <div className="space-y-3">
                <Label>Requirements</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {requirementOptions.map((req) => {
                    const checked = values.requirements.includes(req.value);
                    return (
                      <div key={req.value} className="flex items-center gap-3 rounded-xl border p-3.5">
                        <Checkbox
                          id={`req-${req.value}`}
                          checked={checked}
                          onCheckedChange={(v) =>
                            setFieldValue('requirements', v ? [...values.requirements, req.value] : values.requirements.filter((r) => r !== req.value))
                          }
                        />
                        <Label htmlFor={`req-${req.value}`} className="flex-1 cursor-pointer font-medium">{req.label}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Section>

            {/* Cover image */}
            <Section icon={ImagePlus} title="Cover image" description="Paste an image link (optional). If you skip it, a photo for your category is used.">
              <FormInput name="coverImage" type="url" label="Image URL" placeholder="https://..." />
              <div className="aspect-[16/6] overflow-hidden rounded-xl border bg-muted">
                <img
                  src={values.coverImage || CATEGORY_IMAGES[values.category] || '/default-event.svg'}
                  alt="Cover preview"
                  onError={imgFallback}
                  className="h-full w-full object-cover"
                />
              </div>
              {!values.coverImage && values.category && (
                <p className="text-xs text-muted-foreground">Showing the default {getCategory(values.category).label} photo.</p>
              )}
            </Section>

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="ghost" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSubmitting || loading}
                onClick={() => { statusRef.current = 'draft'; submitForm(); }}
              >
                Save as draft
              </Button>
              <Button
                type="submit"
                size="lg"
                variant="gradient"
                disabled={isSubmitting || loading}
                onClick={() => { statusRef.current = 'published'; }}
              >
                {isSubmitting || loading ? (<><Loader2 className="animate-spin" /> Publishing...</>) : 'Publish event'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateEventPage;
