import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnDestroy,
  signal,
  type OnInit
} from '@angular/core';
import {
  ModalOrderComponent,
  type ModalStage,
  type OrderFormValue
} from '../../shared/ui/modal/modal-order/modal-order';
import {HttpClient} from '@angular/common/http';
import {HeroSliderComponent} from '../../shared/layout/hero-slider/hero-slider';
import {ServicesSectionComponent} from '../../shared/layout/services-section/services-section';
import {AboutSectionComponent} from '../../shared/layout/about-section/about-section';
import {ReviewsSliderComponent} from '../../shared/layout/reviews-slider/reviews-slider';
import {BlogSectionComponent} from '../../shared/layout/blog-section/blog-section';
import {ContactsSectionComponent} from '../../shared/layout/contacts-section/contacts-section';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import type {ArticleInterface} from '../../../types/article.interface';
import type { HeroSlideType } from '../../../types/hero-slide.type';
import type { ReviewType } from '../../../types/review.type';
import type { ServiceCardData } from '../../../types/service-card-data.type';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    ModalOrderComponent,
    ServicesSectionComponent,
    HeroSliderComponent,
    ReviewsSliderComponent,
    AboutSectionComponent,
    BlogSectionComponent,
    ContactsSectionComponent
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private fragmentSub?: Subscription;

  public readonly isModalOpen = signal(false);
  public readonly modalStage = signal<ModalStage>('form');
  public readonly isSubmitting = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly selectedServiceTitle = signal<string | null>(null);

  public readonly blogArticles = signal<ArticleInterface[]>([]);
  public readonly isLoadingArticles = signal<boolean>(false);
  public readonly articlesError = signal<string | null>(null);

  public readonly allServiceTitles: string[] = [
    'Создание сайтов',
    'Продвижение',
    'Реклама',
    'Копирайтинг'
  ];

  public readonly heroSlides: HeroSlideType[] = [
    {
      subtitle: 'ПРЕДЛОЖЕНИЕ МЕСЯЦА',
      titleParts: [
        { text: 'Продвижение в Instagram для вашего бизнеса', isHighlighted: false },
        { text: '-15%', isHighlighted: true },
        { text: '!', isHighlighted: false },
      ],
      fullTitle: 'Продвижение в Instagram для вашего бизнеса -15%!',
      buttonText: 'Подробнее',
      imageUrl: 'assets/images/slider/hero-1.png',
      serviceTitle: 'Реклама',
    },
    {
      subtitle: 'АКЦИЯ',
      titleParts: [
        { text: 'Нужен грамотный', isHighlighted: false },
        { text: 'копирайтер', isHighlighted: true },
        { text: '?', isHighlighted: false },
      ],
      fullTitle: 'Нужен грамотный копирайтер?',
      description: 'Весь декабрь у нас действует акция на работу копирайтера.',
      buttonText: 'Подробнее',
      imageUrl: 'assets/images/slider/hero-2.png',
      serviceTitle: 'Копирайтинг',
    },
    {
      subtitle: 'НОВОСТЬ ДНЯ',
      titleParts: [
        { text: '6 место', isHighlighted: true },
        { text: ' в ТОП-10 SMM-агентств Москвы!', isHighlighted: false },
      ],
      fullTitle: '6 место в ТОП-10 SMM-агентств Москвы!',
      description: 'Мы благодарим каждого, кто голосовал за нас!',
      buttonText: 'Подробнее',
      imageUrl: 'assets/images/slider/hero-3.png',
      serviceTitle: 'Реклама',
    },
  ];

  public readonly services: ServiceCardData[] = [
    {
      id: 1,
      title: 'Создание сайтов',
      description: 'В краткие сроки мы создадим качественный и самое главное продающий сайт для продвижения Вашего бизнеса!',
      price: 'От 7 500₽',
      buttonText: 'Подробнее',
    },
    {
      id: 2,
      title: 'Продвижение',
      description: 'Вам нужен качественный SMM-специалист или грамотный таргетолог? Мы готовы оказать Вам услугу "Продвижения" на наивысшем уровне!',
      price: 'От 3 500₽',
      buttonText: 'Подробнее',
    },
    {
      id: 3,
      title: 'Реклама',
      description: 'Без рекламы не может обойтись ни один бизнес или специалист. Обращайтесь к нам, мы гарантируем быстрый прирост клиентов за счёт правильно настроенной рекламы.',
      price: 'От 1 000₽',
      buttonText: 'Подробнее',
    },
    {
      id: 4,
      title: 'Копирайтинг',
      description: 'Наши копирайтеры готовы написать Вам любые продающие текста, которые не только обеспечат рост охватов, но и помогут выйти на новый уровень в продажах.',
      price: 'От 750₽',
      buttonText: 'Подробнее',
      isPopular: true,
    }
  ];

  public readonly reviews: ReviewType[] = [
    {
      name: 'Станислав',
      text: 'Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и побудили меня углубиться в тему SMM и начать свою карьеру.',
      avatarUrl: 'assets/images/reviews/rev-1.png',
    },
    {
      name: 'Алёна',
      text: 'Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть.',
      avatarUrl: 'assets/images/reviews/rev-2.png',
    },
    {
      name: 'Мария',
      text: 'Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от простой фирмы по услуге продвижения выросла в мощный блог о важности личного бренда. Класс!',
      avatarUrl: 'assets/images/reviews/rev-3.png',
    },
    {
      name: 'Станислав',
      text: 'Спасибо огромное АйтиШторму за прекрасный блог...',
      avatarUrl: 'assets/images/reviews/rev-1.png',
    },
  ];

  public ngOnInit(): void {
    this.loadTopArticles();
  }

  public ngAfterViewInit(): void {
    this.fragmentSub = this.route.fragment.subscribe((fragment) => {
      if (!fragment) return;

      setTimeout(() => {
        const el = document.getElementById(fragment);
        if (!el) return;

        const headerOffset = 110;
        const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
      }, 0);
    });
  }

  public ngOnDestroy(): void {
    this.fragmentSub?.unsubscribe();
  }

  public loadTopArticles(): void {
    this.isLoadingArticles.set(true);
    this.articlesError.set(null);

    this.http.get<any>('http://localhost:3000/api/articles/top')
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.blogArticles.set(response.items);
          } else if (Array.isArray(response)) {
            this.blogArticles.set(response);
          } else {
            this.blogArticles.set([]);
          }
          this.isLoadingArticles.set(false);
        },
        error: (error) => {
          this.articlesError.set('Не удалось загрузить статьи');
          this.blogArticles.set([]);
          this.isLoadingArticles.set(false);
          console.error('Ошибка загрузки статей:', error);
        }
      });
  }

  public openOrderModal(serviceTitle?: string): void {
    this.selectedServiceTitle.set(serviceTitle ?? null);
    this.isModalOpen.set(true);
    this.modalStage.set('form');
    this.errorMessage.set(null);
  }

  public closeOrderModal(): void {
    this.isModalOpen.set(false);
    this.selectedServiceTitle.set(null);
    this.isSubmitting.set(false);
    this.errorMessage.set(null);
    this.modalStage.set('form');
  }

  public submitOrder(formData: OrderFormValue): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const requestData = {
      ...formData,
      type: 'order'
    };

    this.http.post('http://localhost:3000/api/requests', requestData)
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set(null);
          this.modalStage.set('success');
          console.log('ORDER SUBMITTED SUCCESSFULLY:', formData);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Произошла ошибка при отправке формы, попробуйте еще раз.');
          this.modalStage.set('form');
          console.error('ORDER SUBMISSION ERROR:', error);
        }
      });
  }

  public onServiceSelected(service: ServiceCardData): void {
    this.openOrderModal(service.title);
  }
}
