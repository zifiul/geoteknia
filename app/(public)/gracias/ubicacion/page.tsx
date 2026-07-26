import { createThankYouPage } from '@/lib/thankyou/create-thank-you-page';

const page = createThankYouPage('ubicacion');

export const generateMetadata = page.generateMetadata;
export default page.default;
