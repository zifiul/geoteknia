import { createThankYouPage } from '@/lib/thankyou/create-thank-you-page';

const page = createThankYouPage('recurso');

export const generateMetadata = page.generateMetadata;
export default page.default;
