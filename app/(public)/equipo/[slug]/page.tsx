import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MemberProfile } from '@/components/organisms/team/MemberProfile';
import { MemberProjects } from '@/components/organisms/team/MemberProjects';
import { JsonLd } from '@/components/seo/json-ld';
import { listPublishedCaseStudiesByTeamMember } from '@/lib/content/case-studies';
import {
  getPublishedTeamMemberBySlug,
  listPublishedTeamMembers,
} from '@/lib/content/team-machinery';
import { env } from '@/lib/env';
import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import { buildPersonSchema } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { resolveContentUrl } from '@/lib/seo/silo-urls';
import { buildTeamMemberSeoBlock } from '@/lib/team/team-member-seo';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const members = await listPublishedTeamMembers();
  return members.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getPublishedTeamMemberBySlug(slug);
  if (!member) {
    return { title: 'Perfil no encontrado' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const seoBlock = buildTeamMemberSeoBlock({
    slug: member.slug,
    fullName: member.fullName,
    jobTitle: member.jobTitle,
    bio: member.bio,
  });
  return buildMetadata(siteUrl, 'team_member', seoBlock, {
    ogImageUrl: member.photoUrl,
  });
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const member = await getPublishedTeamMemberBySlug(slug);
  if (!member) {
    notFound();
  }

  const cases = await listPublishedCaseStudiesByTeamMember(member.id);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const profileUrl = resolveContentUrl(siteUrl, 'team_member', { slug: member.slug });

  const breadcrumbSegments = buildSiloBreadcrumbSegments(
    'team_member',
    { slug: member.slug },
    member.fullName,
  );
  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: segment.name,
    href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
  }));

  const personSchema = buildPersonSchema({
    name: member.fullName,
    url: profileUrl,
    jobTitle: member.jobTitle,
    worksFor: member.worksFor,
    alumniOf: member.alumniOf,
    imageUrl: member.photoUrl,
  });

  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'team_member',
    { slug: member.slug },
    member.fullName,
  );

  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd data={breadcrumbSchema} />
      <MemberProfile
        member={member}
        breadcrumbItems={breadcrumbItems}
        priorityPhoto
      />
      <MemberProjects cases={cases} />
    </>
  );
}
