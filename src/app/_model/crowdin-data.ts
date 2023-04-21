export class CrowdinData {
  public langCode: string;
  public langName: string;

  constructor(public project: string,
              public fileId: number,
              public langSrc: string,
              public statsCode: string,
              public langIdx: number) {
  }

  get projectUrl(): string {
    return `https://crowdin.com/project/${this.project}`;
  }

  get languageUrl(): string {
    return `https://crowdin.com/translate/${this.project}/${this.fileId}/${this.langSrc}-${this.langCode}`;
  }

  get badgeUrl(): string {
    return `https://badges.crowdin.net/${this.project}/localized.svg`;
  }

  get languageBadgeUrl(): string {
    return `https://img.shields.io/badge/dynamic/json?color=rgb(0,128,0)&label=${this.langName}`
      + `&style=plastic&logo=crowdin&query=%24.progress.${this.langIdx}.data.approvalProgress`
      + `&url=https%3A%2F%2Fbadges.awesome-crowdin.com%2Fstats-${this.statsCode}.json`;
  }

  /*
  values for factory-methods can be found when visiting
  https://crowdin.com/project/link-sammlung/tools/app/bds%C2%A6bds
  */
  static factoryEnglish(): CrowdinData {
    return new CrowdinData('Link-Sammlung', 41, 'en-US', '13600041-578513', 1);
  }

  static factoryGerman(): CrowdinData {
    return new CrowdinData('Link-Sammlung', 41, 'de', '13600041-578513', 0);
  }
}
