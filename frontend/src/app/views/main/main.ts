import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  type OnInit
} from '@angular/core';
import {ModalOrderComponent,} from '../../shared/ui/modal/modal-order/modal-order';
import {HttpClient} from '@angular/common/http';
import {HeroSliderComponent} from '../../shared/layout/hero-slider/hero-slider';
import {ServicesSectionComponent} from '../../shared/layout/services-section/services-section';
import {AboutSectionComponent} from '../../shared/layout/about-section/about-section';
import {ReviewsSliderComponent} from '../../shared/layout/reviews-slider/reviews-slider';
import type {ServiceCardData} from '../../shared/layout/service-card/service-card';
import {
  BlogSectionComponent
} from '../../shared/layout/blog-section/blog-section';
import {
  ContactsSectionComponent
} from '../../shared/layout/contacts-section/contacts-section';
import type {BlogPost} from '../../../types/blog-card.type';
import type {ArticleInterface} from '../../../types/article.interface';


type HeroSlide = {
  subtitle: string;
  titleParts: Array<{
    text: string;
    isHighlighted: boolean;
  }>;
  fullTitle: string;
  description?: string;
  buttonText: string;
  imageUrl: string;
};

type Review = {
  name: string;
  text: string;
  avatarUrl: string;
};

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
    ContactsSectionComponent],
  templateUrl: './main.html',
  styleUrl: './main.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})


export class Main implements OnInit {


  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  isOrderModalOpen = false;
  isSubmitting = false;
  orderServiceTitle: string | null = null;
  ModalStage: 'form' | 'success' = 'form';
  orderError: string | null = null;

  blogArticles: ArticleInterface[] = [];

  isLoadingArticles = false;
  articlesError: string | null = null;

  ngOnInit() {
    this.loadTopArticles();
  }

  // Временно инициализируем моковые данные прямо в свойстве:
  // blogArticles: ArticleInterface[] = [
  //   {
  //     id: '1',
  //     title: 'Создание сайтов',
  //     description: 'В краткие сроки мы создадим качественный и самое главное продающий сайт для продвижения Вашего бизнеса!',
  //     image: 'blog-1.png',
  //     date: new Date().toISOString(),
  //     category: 'Тест',
  //     url: 'test-article-1'
  //   },
  //   {
  //     id: '2',
  //     title: 'Продвижение',
  //     description: 'Вам нужен качественный SMM-специалист или грамотный таргетолог? Мы готовы оказать Вам услугу “Продвижения” на наивысшем уровне!',
  //     image: 'blog-2.png',
  //     date: new Date().toISOString(),
  //     category: 'Тест',
  //     url: 'test-article-2'
  //   },
  //   {
  //     id: '3',
  //     title: 'Реклама',
  //     description: 'Без рекламы не может обойтись ни один бизнес или специалист. Обращаясь к нам, мы гарантируем быстрый прирост клиентов за счёт правильно настроенной рекламы.',
  //     image: 'blog-3.png',
  //     date: new Date().toISOString(),
  //     category: 'Тест',
  //     url: 'test-article-3'
  //   },
  //   {
  //     id: '4',
  //     title: 'Копирайтинг',
  //     description: 'Наши копирайтеры готовы написать Вам любые продающие текста, которые не только обеспечат рост охватов, но и помогут выйти на новый уровень в продажах.',
  //     image: 'blog-4.png',
  //     date: new Date().toISOString(),
  //     category: 'Тест',
  //     url: 'test-article-4'
  //   }
  // ];


  loadTopArticles() {

    this.isLoadingArticles = true;
    this.articlesError = null;

    console.log('Fetching articles from:', 'http://localhost:3000/api/articles/top');

    this.http.get<any>('http://localhost:3000/api/articles/top')
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);

          // ВАЖНО: Сервер может возвращать либо массив, либо объект с полем items
          // Проверяем оба варианта
          if (response && response.items) {
            // Если сервер возвращает { items: [], count: X, pages: X }
            this.blogArticles = response.items;
          } else if (Array.isArray(response)) {
            // Если сервер возвращает просто массив
            this.blogArticles = response;
          } else {
            // Если что-то другое
            this.blogArticles = [];
            console.warn('Unexpected response format:', response);
          }

          console.log('Processed articles:', this.blogArticles);
          this.isLoadingArticles = false;
          this.cdr.detectChanges(); // ОБЯЗАТЕЛЬНО ДОБАВЬТЕ!
        },
        error: (error) => {
          console.error('Error loading articles:', error);
          this.articlesError = 'Не удалось загрузить статьи';
          this.blogArticles = []; // Очищаем на случай ошибки
          this.isLoadingArticles = false;
          this.cdr.detectChanges(); // ОБЯЗАТЕЛЬНО ДОБАВЬТЕ!
        }
      });
  }


  allServiceTitles: string[] = [
    'Создание сайтов',
    'Продвижение',
    'Реклама',
    'Копирайтинг'
  ];

  heroSlides: HeroSlide[] = [
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
    },
  ];

  // blogPosts: BlogPost[] = [
  //   {
  //     id: 1,
  //     title: '6 сайтов для повышения продуктивности',
  //     excerpt: 'Хотите проводить время в сети с пользой? Наша подборка из шести полезных, но малоизвестных сайтов увеличит вашу продуктивность, поможет успевать больше в течение дня и всегда быть на шаг впереди!',
  //     content: 'Полный текст статьи...',
  //     category: 'Фриланс',
  //     tag: 'Фриланс',
  //     imageUrl: 'assets/images/blog/blog-1.png',
  //     readTime: '5 мин',
  //     date: '10.01.2024'
  //   },
  //   {
  //     id: 2,
  //     title: 'Как произвести впечатление на нового клиента?',
  //     excerpt: 'Поиск новых клиентов — это сложная задача не только для новичков, но и для опытных специалистов. Мы расскажем, как справиться с волнением, завоевать доверие клиента и произвести на него потрясающее первое впечатление.',
  //     content: 'Полный текст статьи...',
  //     category: 'Таргет',
  //     tag: 'Таргет',
  //     imageUrl: 'assets/images/blog/blog-2.png',
  //     readTime: '7 мин',
  //     date: '15.01.2024'
  //   },
  //   {
  //     id: 3,
  //     title: 'Как бороться с конкуренцией на фрилансе?',
  //     excerpt: 'Конкуренция — это часть нашей жизни. Мы боремся за место работы, за победу на конкурсе и даже за возможность купить последний круассан в любимом кафе. Фриланс не исключение.',
  //     content: 'Полный текст статьи...',
  //     category: 'Фриланс',
  //     tag: 'Фриланс',
  //     imageUrl: 'assets/images/blog/blog-3.png',
  //     readTime: '6 мин',
  //     date: '20.01.2024'
  //   },
  //   {
  //     id: 4,
  //     title: 'SMM-специалисты: кто они?',
  //     excerpt: 'Профессия SММ-менеджера набирает все большую популярность. В эпоху интернета уже не только новости – приобретение товаров и услуг уходит в онлайн, а просмотр любимых сайтов становится ежедневной рутиной.',
  //     content: 'Полный текст статьи...',
  //     category: 'SMM',
  //     tag: 'SMM',
  //     imageUrl: 'assets/images/blog/blog-4.png',
  //     readTime: '8 мин',
  //     date: '25.01.2024'
  //   }
  // ];

  reviews: Review[] = [
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

  services: ServiceCardData[] = [
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
      description: 'Вам нужен качественный SMM-специалист или грамотный таргетолог? Мы готовы оказать Вам услугу “Продвижения” на наивысшем уровне!',
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

  openOrderModal(serviceTitle?: string) {
    this.orderServiceTitle = serviceTitle ?? null;
    this.isOrderModalOpen = true;
    this.ModalStage = 'form';
  }

  closeOrderModal() {
    this.isOrderModalOpen = false;
    this.orderServiceTitle = null;
    this.isSubmitting = false;
    this.orderError = null;
    this.ModalStage = 'form';
  }

  submitOrder(data: { name: string; phone: string }): void {
    this.isSubmitting = true;
    this.orderError = null;
    this.cdr.detectChanges();

    const requestData = {
      ...data,
      type: 'order'
    };

    this.http.post('http://localhost:3000/api/requests', requestData)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.orderError = null;
          this.ModalStage = 'success';
          this.cdr.detectChanges();
          console.log('ORDER SUBMITTED SUCCESSFULLY:', data);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.orderError = 'произошла ошибка при отправке формы, попробуйте еще раз.';
          this.ModalStage = 'form';
          console.error('ORDER SUBMISSION ERROR:', error);
          this.cdr.detectChanges();
        }
      });
  }

  onServiceSelected(service: ServiceCardData) {
    console.log('Service selected:', service);
    this.openOrderModal(service.title);
  }
}
