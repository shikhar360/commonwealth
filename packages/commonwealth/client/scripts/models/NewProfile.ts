import type { Image } from '../views/components/edit_profile';

class NewProfile {
  private _name: string;
  private _email: string;
  private _website: string;
  private _bio: string;
  private _isDefault: boolean;
  private _avatarUrl: string;
  private _slug: string;
  private _socials: string[];
  private _id: number;
  private _isOwner: boolean;
  private _backgroundImage: Image;

  get name() {
    return this._name;
  }

  get email() {
    return this._email;
  }

  get website() {
    return this._website;
  }

  get bio() {
    return this._bio;
  }

  get isDefault() {
    return this._isDefault;
  }

  get avatarUrl() {
    return this._avatarUrl;
  }

  get slug() {
    return this._slug;
  }

  get socials() {
    return this._socials;
  }

  get id() {
    return this._id;
  }

  get isOwner() {
    return this._isOwner;
  }

  get backgroundImage() {
    return this._backgroundImage;
  }

  constructor({
    profile_name,
    email,
    website,
    bio,
    is_default,
    avatar_url,
    slug,
    socials,
    id,
    is_owner,
    background_image,
  }) {
    this._name = profile_name;
    this._email = email;
    this._website = website;
    this._bio = bio;
    this._isDefault = is_default;
    this._avatarUrl = avatar_url;
    this._slug = slug;
    this._socials = socials;
    this._id = id;
    this._isOwner = is_owner;
    this._backgroundImage = background_image;
  }

  public initialize(
    name,
    email,
    website,
    bio,
    isDefault,
    avatarUrl,
    slug,
    socials,
    id,
    isOwner,
    backgroundImage
  ) {
    this._name = name;
    this._email = email;
    this._website = website;
    this._bio = bio;
    this._isDefault = isDefault;
    this._avatarUrl = avatarUrl;
    this._slug = slug;
    this._socials = socials;
    this._id = id;
    this._isOwner = isOwner;
    this._backgroundImage = backgroundImage;
  }

  public static fromJSON(json) {
    return new NewProfile(json);
  }
}

export default NewProfile;
