import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_hero_sections';
  info: {
    displayName: 'Hero Section';
  };
  attributes: {
    Image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Links: Schema.Attribute.Component<'elements.link', true>;
    MainHeading: Schema.Attribute.String;
    SubHeading: Schema.Attribute.String;
    Text: Schema.Attribute.Text;
  };
}

export interface BlocksTeam extends Struct.ComponentSchema {
  collectionName: 'components_blocks_teams';
  info: {
    displayName: 'Team';
  };
  attributes: {
    teams: Schema.Attribute.Relation<'oneToMany', 'api::team.team'>;
  };
}

export interface ElementsHeader extends Struct.ComponentSchema {
  collectionName: 'components_elements_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    Header: Schema.Attribute.String;
    SubHeder: Schema.Attribute.String;
    Text: Schema.Attribute.Text;
  };
}

export interface ElementsLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    Href: Schema.Attribute.String;
    IsExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Label: Schema.Attribute.String;
    Type: Schema.Attribute.Enumeration<['LINK', 'PRIMARY', 'SECONDARY']>;
  };
}

export interface ScheduleOperatingHours extends Struct.ComponentSchema {
  collectionName: 'components_schedule_operating_hours';
  info: {
    description: 'Daily operating hours for the clinic';
    displayName: 'Operating Hours';
  };
  attributes: {
    closeTime: Schema.Attribute.Time;
    dayOfWeek: Schema.Attribute.Enumeration<
      [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]
    > &
      Schema.Attribute.Required;
    isClosed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    openTime: Schema.Attribute.Time;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SocialSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_social_social_links';
  info: {
    description: 'Social media links and profiles';
    displayName: 'Social Link';
  };
  attributes: {
    displayName: Schema.Attribute.String;
    platform: Schema.Attribute.Enumeration<
      [
        'Facebook',
        'Instagram',
        'Twitter',
        'LinkedIn',
        'YouTube',
        'TikTok',
        'WhatsApp',
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.hero-section': BlocksHeroSection;
      'blocks.team': BlocksTeam;
      'elements.header': ElementsHeader;
      'elements.link': ElementsLink;
      'schedule.operating-hours': ScheduleOperatingHours;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'social.social-link': SocialSocialLink;
    }
  }
}
