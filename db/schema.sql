--
-- PostgreSQL database dump
--

\restrict ZU497xVtf0hpDrg6zucDJbaCGSxi6rIhVMgHav5g0w9DFIkRyicdY6CmeL4dRsx

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

-- Started on 2026-04-02 14:54:46

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 7 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: zgweb_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO zgweb_user;

--
-- TOC entry 2 (class 3079 OID 16565)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 3 (class 3079 OID 16602)
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- TOC entry 920 (class 1247 OID 16630)
-- Name: article_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.article_status_enum AS ENUM (
    'draft',
    'pending_review',
    'published',
    'offline',
    'archived'
);


ALTER TYPE public.article_status_enum OWNER TO postgres;

--
-- TOC entry 929 (class 1247 OID 16660)
-- Name: banner_link_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.banner_link_type_enum AS ENUM (
    'article',
    'category',
    'url',
    'none'
);


ALTER TYPE public.banner_link_type_enum OWNER TO postgres;

--
-- TOC entry 917 (class 1247 OID 16618)
-- Name: category_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.category_type_enum AS ENUM (
    'single',
    'list',
    'download',
    'link',
    'special'
);


ALTER TYPE public.category_type_enum OWNER TO postgres;

--
-- TOC entry 923 (class 1247 OID 16642)
-- Name: content_format_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.content_format_enum AS ENUM (
    'html',
    'markdown',
    'json'
);


ALTER TYPE public.content_format_enum OWNER TO postgres;

--
-- TOC entry 926 (class 1247 OID 16650)
-- Name: review_action_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_action_enum AS ENUM (
    'submit',
    'approve',
    'reject',
    'offline'
);


ALTER TYPE public.review_action_enum OWNER TO postgres;

--
-- TOC entry 914 (class 1247 OID 16610)
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status_enum AS ENUM (
    'active',
    'disabled',
    'locked'
);


ALTER TYPE public.user_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 239 (class 1259 OID 16882)
-- Name: article_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_reviews (
    id bigint NOT NULL,
    article_id bigint NOT NULL,
    reviewer_id bigint NOT NULL,
    review_action public.review_action_enum NOT NULL,
    review_comment text,
    reviewed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.article_reviews OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16881)
-- Name: article_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.article_reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 238
-- Name: article_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.article_reviews_id_seq OWNED BY public.article_reviews.id;


--
-- TOC entry 241 (class 1259 OID 16902)
-- Name: article_revisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_revisions (
    id bigint NOT NULL,
    article_id bigint NOT NULL,
    version_no integer NOT NULL,
    title character varying(255) NOT NULL,
    content_html text,
    content_json jsonb,
    operator_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.article_revisions OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16901)
-- Name: article_revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.article_revisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_revisions_id_seq OWNER TO postgres;

--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 240
-- Name: article_revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.article_revisions_id_seq OWNED BY public.article_revisions.id;


--
-- TOC entry 229 (class 1259 OID 16796)
-- Name: article_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_tags (
    article_id bigint NOT NULL,
    tag_id bigint NOT NULL
);


ALTER TABLE public.article_tags OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16924)
-- Name: article_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.article_views (
    id bigint NOT NULL,
    article_id bigint NOT NULL,
    ip_address character varying(64),
    user_agent text,
    viewed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.article_views OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16923)
-- Name: article_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.article_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.article_views_id_seq OWNER TO postgres;

--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 242
-- Name: article_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.article_views_id_seq OWNED BY public.article_views.id;


--
-- TOC entry 224 (class 1259 OID 16728)
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    subtitle character varying(255),
    slug character varying(255) NOT NULL,
    summary text,
    content_format public.content_format_enum DEFAULT 'html'::public.content_format_enum NOT NULL,
    content_html text,
    content_json jsonb,
    cover_image_url text,
    source character varying(255),
    author_name character varying(100),
    status public.article_status_enum DEFAULT 'draft'::public.article_status_enum NOT NULL,
    publish_time timestamp without time zone,
    offline_time timestamp without time zone,
    is_top boolean DEFAULT false NOT NULL,
    is_recommend boolean DEFAULT false NOT NULL,
    allow_comment boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    seo_title character varying(255),
    seo_description text,
    seo_keywords character varying(255),
    created_by bigint,
    updated_by bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    images jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16727)
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO postgres;

--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 223
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- TOC entry 245 (class 1259 OID 16939)
-- Name: attachment_download_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachment_download_logs (
    id bigint NOT NULL,
    attachment_id bigint NOT NULL,
    user_id bigint,
    ip_address character varying(64),
    user_agent text,
    downloaded_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attachment_download_logs OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16938)
-- Name: attachment_download_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attachment_download_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attachment_download_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 244
-- Name: attachment_download_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attachment_download_logs_id_seq OWNED BY public.attachment_download_logs.id;


--
-- TOC entry 226 (class 1259 OID 16762)
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    id bigint NOT NULL,
    article_id bigint,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_ext character varying(20),
    mime_type character varying(100),
    file_size bigint,
    storage_provider character varying(50) DEFAULT 'local'::character varying NOT NULL,
    storage_key character varying(500),
    md5_hash character varying(64),
    download_count integer DEFAULT 0 NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    created_by bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16761)
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attachments_id_seq OWNER TO postgres;

--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 225
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- TOC entry 249 (class 1259 OID 16974)
-- Name: backup_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backup_tasks (
    id bigint NOT NULL,
    backup_type character varying(30) NOT NULL,
    file_path text,
    file_size bigint,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    started_at timestamp without time zone,
    finished_at timestamp without time zone,
    operator_id bigint,
    message text
);


ALTER TABLE public.backup_tasks OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16973)
-- Name: backup_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backup_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.backup_tasks_id_seq OWNER TO postgres;

--
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 248
-- Name: backup_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backup_tasks_id_seq OWNED BY public.backup_tasks.id;


--
-- TOC entry 231 (class 1259 OID 16812)
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    subtitle character varying(255),
    image_url text NOT NULL,
    mobile_image_url text,
    link_type public.banner_link_type_enum DEFAULT 'article'::public.banner_link_type_enum NOT NULL,
    link_url text,
    article_id bigint,
    category_id bigint,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    created_by bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16811)
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banners_id_seq OWNER TO postgres;

--
-- TOC entry 5220 (class 0 OID 0)
-- Dependencies: 230
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- TOC entry 222 (class 1259 OID 16704)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    parent_id bigint,
    name character varying(100) NOT NULL,
    slug character varying(120) NOT NULL,
    type public.category_type_enum DEFAULT 'list'::public.category_type_enum NOT NULL,
    path character varying(500),
    depth integer DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    description text,
    cover_image_url text,
    icon_url text,
    is_visible boolean DEFAULT true NOT NULL,
    is_nav boolean DEFAULT true NOT NULL,
    external_url text,
    seo_title character varying(255),
    seo_description text,
    seo_keywords character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16703)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5223 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 237 (class 1259 OID 16870)
-- Name: friendly_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friendly_links (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    url text NOT NULL,
    logo_url text,
    group_name character varying(100),
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.friendly_links OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16869)
-- Name: friendly_links_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.friendly_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.friendly_links_id_seq OWNER TO postgres;

--
-- TOC entry 5226 (class 0 OID 0)
-- Dependencies: 236
-- Name: friendly_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.friendly_links_id_seq OWNED BY public.friendly_links.id;


--
-- TOC entry 235 (class 1259 OID 16856)
-- Name: home_modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.home_modules (
    id bigint NOT NULL,
    module_code character varying(50) NOT NULL,
    module_name character varying(100) NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    config_json jsonb,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.home_modules OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16855)
-- Name: home_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.home_modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.home_modules_id_seq OWNER TO postgres;

--
-- TOC entry 5229 (class 0 OID 0)
-- Dependencies: 234
-- Name: home_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.home_modules_id_seq OWNED BY public.home_modules.id;


--
-- TOC entry 247 (class 1259 OID 16959)
-- Name: operation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_logs (
    id bigint NOT NULL,
    user_id bigint,
    username character varying(100),
    action character varying(100) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id bigint,
    detail jsonb,
    ip_address character varying(64),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.operation_logs OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16958)
-- Name: operation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operation_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 0)
-- Dependencies: 246
-- Name: operation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_logs_id_seq OWNED BY public.operation_logs.id;


--
-- TOC entry 218 (class 1259 OID 16670)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16669)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5235 (class 0 OID 0)
-- Dependencies: 217
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 233 (class 1259 OID 16841)
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id bigint NOT NULL,
    site_name character varying(255) NOT NULL,
    site_name_en character varying(255),
    logo_url text,
    favicon_url text,
    footer_text text,
    address text,
    phone character varying(100),
    email character varying(150),
    icp_no character varying(100),
    police_record_no character varying(100),
    default_seo_title character varying(255),
    default_seo_desc text,
    default_seo_keywords character varying(255),
    copyright_text text,
    updated_by bigint,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16840)
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO postgres;

--
-- TOC entry 5238 (class 0 OID 0)
-- Dependencies: 232
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- TOC entry 228 (class 1259 OID 16785)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(80) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16784)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 227
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 220 (class 1259 OID 16684)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    real_name character varying(100),
    email character varying(150),
    mobile character varying(30),
    status public.user_status_enum DEFAULT 'active'::public.user_status_enum NOT NULL,
    role_id bigint NOT NULL,
    last_login_at timestamp without time zone,
    last_login_ip character varying(64),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16683)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4927 (class 2604 OID 16885)
-- Name: article_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_reviews ALTER COLUMN id SET DEFAULT nextval('public.article_reviews_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 16905)
-- Name: article_revisions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_revisions ALTER COLUMN id SET DEFAULT nextval('public.article_revisions_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 16927)
-- Name: article_views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_views ALTER COLUMN id SET DEFAULT nextval('public.article_views_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 16731)
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 16942)
-- Name: attachment_download_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachment_download_logs ALTER COLUMN id SET DEFAULT nextval('public.attachment_download_logs_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 16765)
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- TOC entry 4937 (class 2604 OID 16977)
-- Name: backup_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_tasks ALTER COLUMN id SET DEFAULT nextval('public.backup_tasks_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 16815)
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- TOC entry 4886 (class 2604 OID 16707)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 16873)
-- Name: friendly_links id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendly_links ALTER COLUMN id SET DEFAULT nextval('public.friendly_links_id_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 16859)
-- Name: home_modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.home_modules ALTER COLUMN id SET DEFAULT nextval('public.home_modules_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 16962)
-- Name: operation_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_logs ALTER COLUMN id SET DEFAULT nextval('public.operation_logs_id_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 16673)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 16844)
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- TOC entry 4909 (class 2604 OID 16788)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 16687)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5179 (class 0 OID 16882)
-- Dependencies: 239
-- Data for Name: article_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_reviews (id, article_id, reviewer_id, review_action, review_comment, reviewed_at) FROM stdin;
\.


--
-- TOC entry 5181 (class 0 OID 16902)
-- Dependencies: 241
-- Data for Name: article_revisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_revisions (id, article_id, version_no, title, content_html, content_json, operator_id, created_at) FROM stdin;
\.


--
-- TOC entry 5169 (class 0 OID 16796)
-- Dependencies: 229
-- Data for Name: article_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_tags (article_id, tag_id) FROM stdin;
\.


--
-- TOC entry 5183 (class 0 OID 16924)
-- Dependencies: 243
-- Data for Name: article_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.article_views (id, article_id, ip_address, user_agent, viewed_at) FROM stdin;
\.


--
-- TOC entry 5164 (class 0 OID 16728)
-- Dependencies: 224
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (id, category_id, title, subtitle, slug, summary, content_format, content_html, content_json, cover_image_url, source, author_name, status, publish_time, offline_time, is_top, is_recommend, allow_comment, view_count, seo_title, seo_description, seo_keywords, created_by, updated_by, created_at, updated_at, images) FROM stdin;
2	3	测试公告：清明节放假通知	\N	test-notice-1	这是一条测试公告摘要	html	<p>这是测试公告正文。</p>	\N	\N	\N	\N	published	2026-03-31 16:52:36.429409	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-03-31 16:52:36.429409	2026-03-31 16:52:36.429409	[]
4	2	沈阳工业大学卓越工程师学院来我院调研交流	\N	test-news-3	沈阳工业大学卓越工程师学院一行来我校调研，双方就人才培养模式进行深入交流。	html	<p>3月28日，沈阳工业大学副校长率队来访，我院校长助理陪同参观实验室并召开座谈会。</p>	\N	\N	\N	\N	published	2026-03-27 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
5	2	国家卓越工程师学院举办第四期卓越讲堂	\N	test-news-4	第四期卓越讲堂邀请中国工程院院士主讲，吸引300余名师生参加。	html	<p>3月25日，卓越讲堂第四期在报告厅举行，主题为“智能制造与未来工程教育”。</p>	\N	\N	\N	\N	published	2026-03-25 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
6	2	我院研究生在国家数学建模竞赛中获一等奖	\N	test-news-5	我校3名研究生组成的团队在全国大学生数学建模竞赛中荣获一等奖。	html	<p>竞赛于3月20日结束，我院研究生团队凭借优秀建模方案获得全国一等奖。</p>	\N	\N	\N	\N	published	2026-03-22 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
7	2	学院召开2026年春季教学工作推进会	\N	test-news-6	会议部署了本学期教学改革重点任务，校长出席并讲话。	html	<p>3月18日，学院召开2026年春季教学工作推进会，全体中层干部参加。</p>	\N	\N	\N	\N	published	2026-03-20 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
8	2	我院与中车集团签订校企合作协议	\N	test-news-7	双方将在高铁智能制造领域开展深度产学研合作。	html	<p>3月15日，我院与中车集团签署战略合作协议，共建智能制造联合实验室。</p>	\N	\N	\N	\N	published	2026-03-17 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
9	2	2026年本科招生简章正式发布	\N	test-news-8	今年新增3个国家级一流本科专业，招生计划增加10%。	html	<p>招生简章已上线官网，欢迎广大考生关注。</p>	\N	\N	\N	\N	published	2026-03-14 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
10	2	学院图书馆新馆建设项目开工	\N	test-news-9	新馆总建筑面积2.8万平方米，预计2027年投入使用。	html	<p>3月10日，图书馆新馆奠基仪式隆重举行。</p>	\N	\N	\N	\N	published	2026-03-12 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
11	2	我院教师获省教学成果一等奖	\N	test-news-10	获奖项目为“基于产教融合的卓越工程师培养模式创新与实践”。	html	<p>3月5日，省教育厅公布2025年度教学成果奖名单，我院两项成果获奖。</p>	\N	\N	\N	\N	published	2026-03-07 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
12	2	清明节假期安排及安全提醒	\N	test-news-11	4月3日至5日放假，共3天，提醒师生注意出行安全。	html	<p>假期期间图书馆、食堂正常开放，实验室需提前报备。</p>	\N	\N	\N	\N	published	2026-03-04 09:03:04.08912	\N	f	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	[]
3	2	我院成功获批国家级卓越工程师学院	\N	test-news-2	我院于近日正式获批国家级卓越工程师学院，成为全国首批获批高校之一。	html	<p>2026年3月，我院国家卓越工程师学院建设取得重大突破，正式获批国家级卓越工程师学院。</p><p>这是我校在工程教育改革领域取得的里程碑成果。</p>	\N	\N	\N	\N	published	2026-03-30 09:03:04.08912	\N	t	f	f	0	\N	\N	\N	\N	\N	2026-04-01 09:03:04.08912	2026-04-01 09:03:04.08912	["https://picsum.photos/id/1015/800/600"]
1	2	测试新闻：学院召开教学工作会	\N	test-news-1	这是一条测试新闻摘要	html	<p>这是测试新闻正文。</p>	\N	\N	\N	\N	published	2026-03-31 16:52:36.429409	\N	t	f	f	0	\N	\N	\N	\N	\N	2026-03-31 16:52:36.429409	2026-03-31 16:52:36.429409	["https://picsum.photos/id/1015/800/600"]
13	3	关于2026年清明节放假的通知	\N	notice-2026-qingming	清明节放假安排已发布，请全体师生遵守。	html	<p>清明节放假3天，4月4日至6日...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=清明	\N	\N	published	2026-03-31 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=清明"]
14	3	研究生招生简章发布	\N	notice-2026-zhaosheng	2026年硕士/博士招生简章正式发布。	html	<p>报名时间：即日起至4月15日...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=招生	\N	\N	published	2026-03-30 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=招生"]
15	3	校园安全演练通知	\N	notice-2026-anquan	本周五开展消防安全演练，请各学院组织参与。	html	<p>演练地点：操场...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=安全	\N	\N	published	2026-03-29 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=安全"]
16	3	图书馆闭馆通知	\N	notice-2026-tushuguan	3月31日图书馆临时闭馆维修。	html	<p>闭馆时间：全天...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=图书馆	\N	\N	published	2026-03-28 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=图书馆"]
17	3	奖学金申请启动	\N	notice-2026-jiangxuejin	2026年度国家奖学金申请开始。	html	<p>申请截止：4月15日...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=奖学金	\N	\N	published	2026-03-27 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=奖学金"]
18	3	校企合作签约仪式	\N	notice-2026-hezuo	与华为公司签署战略合作协议。	html	<p>签约地点：行政楼...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=合作	\N	\N	published	2026-03-26 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=合作"]
19	3	学生会换届选举	\N	notice-2026-xueshenghui	2026年学生会换届选举开始报名。	html	<p>报名方式：线上...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=学生会	\N	\N	published	2026-03-25 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=学生会"]
20	3	疫情防护最新要求	\N	notice-2026-yiqing	学校发布最新疫情防控措施。	html	<p>请佩戴口罩...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=防疫	\N	\N	published	2026-03-24 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=防疫"]
21	3	毕业设计答辩安排	\N	notice-2026-biyesheji	2026届毕业设计答辩时间表公布。	html	<p>答辩日期：5月10-20日...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=答辩	\N	\N	published	2026-03-23 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=答辩"]
22	3	后勤服务投诉通道	\N	notice-2026-houqin	开通后勤服务在线投诉平台。	html	<p>欢迎师生反馈...</p>	\N	https://via.placeholder.com/600x600/FF9500/FFFFFF?text=后勤	\N	\N	published	2026-03-22 15:57:33.09771	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-01 15:57:33.09771	2026-04-01 15:57:33.09771	["https://via.placeholder.com/600x600/FF9500/FFFFFF?text=后勤"]
25	2	院长出席全国卓越工程师培养论坛	\N	test-news-21	我院院长受邀出席在北京举办的全国卓越工程师培养论坛并作主旨发言。	html	<p>论坛于3月20日在北京召开...</p>	\N	https://picsum.photos/id/1016/800/600	\N	\N	published	2026-03-22 09:23:13.133732	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-02 09:23:13.133732	2026-04-02 09:23:13.133732	["https://picsum.photos/id/1016/800/600"]
26	2	我院与华为签署产教融合协议	\N	test-news-22	我院与华为技术有限公司正式签署产教融合合作协议，共建实习实训基地。	html	<p>签约仪式于3月18日举行...</p>	\N	https://picsum.photos/id/1018/800/600	\N	\N	published	2026-03-20 09:23:13.133732	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-02 09:23:13.133732	2026-04-02 09:23:13.133732	["https://picsum.photos/id/1018/800/600"]
27	2	第五期卓越讲堂圆满举办	\N	test-news-23	第五期卓越讲堂邀请中国科学院院士主讲前沿科技，吸引400余名师生参与。	html	<p>讲堂于3月15日在大礼堂举行...</p>	\N	https://picsum.photos/id/1019/800/600	\N	\N	published	2026-03-17 09:23:13.133732	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-02 09:23:13.133732	2026-04-02 09:23:13.133732	["https://picsum.photos/id/1019/800/600"]
28	2	我院学生团队斩获省级创新创业大赛金奖	\N	test-news-24	我院学生创新团队在省级双创大赛中荣获金奖，并获得50万元创业扶持资金。	html	<p>颁奖典礼于3月12日举行...</p>	\N	https://picsum.photos/id/1020/800/600	\N	\N	published	2026-03-14 09:23:13.133732	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-02 09:23:13.133732	2026-04-02 09:23:13.133732	["https://picsum.photos/id/1020/800/600"]
29	2	学院召开2026年人才培养方案修订工作会	\N	test-news-25	学院召开2026年人才培养方案修订专题工作会，各系主任及骨干教师参加。	html	<p>会议于3月10日在行政楼召开...</p>	\N	https://picsum.photos/id/1021/800/600	\N	\N	published	2026-03-12 09:23:13.133732	\N	f	t	f	0	\N	\N	\N	\N	\N	2026-04-02 09:23:13.133732	2026-04-02 09:23:13.133732	["https://picsum.photos/id/1021/800/600"]
\.


--
-- TOC entry 5185 (class 0 OID 16939)
-- Dependencies: 245
-- Data for Name: attachment_download_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attachment_download_logs (id, attachment_id, user_id, ip_address, user_agent, downloaded_at) FROM stdin;
\.


--
-- TOC entry 5166 (class 0 OID 16762)
-- Dependencies: 226
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attachments (id, article_id, file_name, file_url, file_ext, mime_type, file_size, storage_provider, storage_key, md5_hash, download_count, is_public, created_by, created_at) FROM stdin;
1	13	2026清明节放假通知.pdf	https://via.placeholder.com/800x600/FF9500/FFFFFF?text=2026清明节放假通知.pdf	\N	\N	2048000	local	\N	\N	0	t	\N	2026-04-01 15:57:33.09771
2	13	研究生招生简章.docx	https://via.placeholder.com/800x600/FF9500/FFFFFF?text=研究生招生简章.docx	\N	\N	2048000	local	\N	\N	0	t	\N	2026-04-01 15:57:33.09771
3	13	校园安全演练手册.pdf	https://via.placeholder.com/800x600/FF9500/FFFFFF?text=校园安全演练手册.pdf	\N	\N	2048000	local	\N	\N	0	t	\N	2026-04-01 15:57:33.09771
4	13	奖学金申请表.xlsx	https://via.placeholder.com/800x600/FF9500/FFFFFF?text=奖学金申请表.xlsx	\N	\N	2048000	local	\N	\N	0	t	\N	2026-04-01 15:57:33.09771
5	13	校企合作协议.pdf	https://via.placeholder.com/800x600/FF9500/FFFFFF?text=校企合作协议.pdf	\N	\N	2048000	local	\N	\N	0	t	\N	2026-04-01 15:57:33.09771
\.


--
-- TOC entry 5189 (class 0 OID 16974)
-- Dependencies: 249
-- Data for Name: backup_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backup_tasks (id, backup_type, file_path, file_size, status, started_at, finished_at, operator_id, message) FROM stdin;
\.


--
-- TOC entry 5171 (class 0 OID 16812)
-- Dependencies: 231
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banners (id, title, subtitle, image_url, mobile_image_url, link_type, link_url, article_id, category_id, sort_order, is_active, start_time, end_time, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5162 (class 0 OID 16704)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, parent_id, name, slug, type, path, depth, sort_order, description, cover_image_url, icon_url, is_visible, is_nav, external_url, seo_title, seo_description, seo_keywords, created_at, updated_at) FROM stdin;
1	\N	学院概况	about	single	/about	1	1	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
2	\N	新闻动态	news	list	/news	1	2	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
3	\N	通知公告	notice	list	/notice	1	3	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
4	\N	招生信息	admission	list	/admission	1	4	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
5	\N	科学研究	research	list	/research	1	5	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
6	\N	师资队伍	faculty	list	/faculty	1	6	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
7	\N	学生工作	students	list	/students	1	7	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
8	\N	管理文件	documents	download	/documents	1	8	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
9	\N	校企合作	cooperation	list	/cooperation	1	9	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
10	1	学院简介	about-intro	single	/about/intro	2	1	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
11	1	现任领导	about-leaders	single	/about/leaders	2	2	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
12	8	政策文件	documents-policies	download	/documents/policies	2	1	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
13	8	资料下载	documents-downloads	download	/documents/downloads	2	2	\N	\N	\N	t	t	\N	\N	\N	\N	2026-03-31 16:23:52.04919	2026-03-31 16:23:52.04919
\.


--
-- TOC entry 5177 (class 0 OID 16870)
-- Dependencies: 237
-- Data for Name: friendly_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friendly_links (id, name, url, logo_url, group_name, sort_order, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 5175 (class 0 OID 16856)
-- Dependencies: 235
-- Data for Name: home_modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.home_modules (id, module_code, module_name, is_enabled, sort_order, config_json, updated_at) FROM stdin;
1	hero_banner	首页轮播	t	1	{}	2026-03-31 16:23:32.687372
2	college_intro	学院简介	t	2	{}	2026-03-31 16:23:32.687372
3	news_section	新闻动态	t	3	{}	2026-03-31 16:23:32.687372
4	notice_section	通知公告	t	4	{}	2026-03-31 16:23:32.687372
5	quick_links	快捷入口	t	5	{}	2026-03-31 16:23:32.687372
6	download_section	下载专区	t	6	{}	2026-03-31 16:23:32.687372
\.


--
-- TOC entry 5187 (class 0 OID 16959)
-- Dependencies: 247
-- Data for Name: operation_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_logs (id, user_id, username, action, resource_type, resource_id, detail, ip_address, created_at) FROM stdin;
\.


--
-- TOC entry 5158 (class 0 OID 16670)
-- Dependencies: 218
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, code, name, description, is_system, created_at, updated_at) FROM stdin;
1	super_admin	超级管理员	\N	t	2026-03-31 16:21:26.515757	2026-03-31 16:21:26.515757
2	content_admin	内容管理员	\N	t	2026-03-31 16:21:26.515757	2026-03-31 16:21:26.515757
3	editor	编辑	\N	t	2026-03-31 16:21:26.515757	2026-03-31 16:21:26.515757
4	reviewer	审核员	\N	t	2026-03-31 16:21:26.515757	2026-03-31 16:21:26.515757
5	viewer	只读访客	\N	t	2026-03-31 16:21:26.515757	2026-03-31 16:21:26.515757
\.


--
-- TOC entry 5173 (class 0 OID 16841)
-- Dependencies: 233
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, site_name, site_name_en, logo_url, favicon_url, footer_text, address, phone, email, icp_no, police_record_no, default_seo_title, default_seo_desc, default_seo_keywords, copyright_text, updated_by, updated_at) FROM stdin;
1	中工学院官网	ZGWEB	\N	\N	© 中工学院 版权所有	\N	\N	\N	\N	\N	中工学院官网	中工学院官方网站	中工学院,高校官网	\N	\N	2026-03-31 16:23:32.687372
\.


--
-- TOC entry 5168 (class 0 OID 16785)
-- Dependencies: 228
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name, slug, created_at) FROM stdin;
\.


--
-- TOC entry 5160 (class 0 OID 16684)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, real_name, email, mobile, status, role_id, last_login_at, last_login_ip, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 238
-- Name: article_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.article_reviews_id_seq', 1, false);


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 240
-- Name: article_revisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.article_revisions_id_seq', 1, false);


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 242
-- Name: article_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.article_views_id_seq', 1, false);


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 223
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_id_seq', 29, true);


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 244
-- Name: attachment_download_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attachment_download_logs_id_seq', 1, false);


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 225
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attachments_id_seq', 5, true);


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 248
-- Name: backup_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backup_tasks_id_seq', 1, false);


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 230
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banners_id_seq', 1, false);


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 15, true);


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 236
-- Name: friendly_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.friendly_links_id_seq', 1, false);


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 234
-- Name: home_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.home_modules_id_seq', 6, true);


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 246
-- Name: operation_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_logs_id_seq', 1, false);


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 217
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 10, true);


--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 232
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, true);


--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 227
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 4979 (class 2606 OID 16890)
-- Name: article_reviews article_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_reviews
    ADD CONSTRAINT article_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4981 (class 2606 OID 16912)
-- Name: article_revisions article_revisions_article_id_version_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_revisions
    ADD CONSTRAINT article_revisions_article_id_version_no_key UNIQUE (article_id, version_no);


--
-- TOC entry 4983 (class 2606 OID 16910)
-- Name: article_revisions article_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_revisions
    ADD CONSTRAINT article_revisions_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 16800)
-- Name: article_tags article_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_pkey PRIMARY KEY (article_id, tag_id);


--
-- TOC entry 4985 (class 2606 OID 16932)
-- Name: article_views article_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_views
    ADD CONSTRAINT article_views_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 16743)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 16745)
-- Name: articles articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);


--
-- TOC entry 4987 (class 2606 OID 16947)
-- Name: attachment_download_logs attachment_download_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachment_download_logs
    ADD CONSTRAINT attachment_download_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 16773)
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 16982)
-- Name: backup_tasks backup_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_tasks
    ADD CONSTRAINT backup_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 16824)
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 16718)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 16720)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 4977 (class 2606 OID 16880)
-- Name: friendly_links friendly_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friendly_links
    ADD CONSTRAINT friendly_links_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 16868)
-- Name: home_modules home_modules_module_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.home_modules
    ADD CONSTRAINT home_modules_module_code_key UNIQUE (module_code);


--
-- TOC entry 4975 (class 2606 OID 16866)
-- Name: home_modules home_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.home_modules
    ADD CONSTRAINT home_modules_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 16967)
-- Name: operation_logs operation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_logs
    ADD CONSTRAINT operation_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 16682)
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- TOC entry 4942 (class 2606 OID 16680)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 16849)
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 16793)
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- TOC entry 4963 (class 2606 OID 16791)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 16795)
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- TOC entry 4945 (class 2606 OID 16694)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 16696)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4957 (class 1259 OID 16992)
-- Name: idx_articles_images; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_images ON public.articles USING gin (images);


--
-- TOC entry 4952 (class 1259 OID 16726)
-- Name: idx_categories_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id);


--
-- TOC entry 4943 (class 1259 OID 16702)
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- TOC entry 5005 (class 2606 OID 16891)
-- Name: article_reviews article_reviews_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_reviews
    ADD CONSTRAINT article_reviews_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 16896)
-- Name: article_reviews article_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_reviews
    ADD CONSTRAINT article_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- TOC entry 5007 (class 2606 OID 16913)
-- Name: article_revisions article_revisions_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_revisions
    ADD CONSTRAINT article_revisions_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- TOC entry 5008 (class 2606 OID 16918)
-- Name: article_revisions article_revisions_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_revisions
    ADD CONSTRAINT article_revisions_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.users(id);


--
-- TOC entry 4999 (class 2606 OID 16801)
-- Name: article_tags article_tags_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- TOC entry 5000 (class 2606 OID 16806)
-- Name: article_tags article_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_tags
    ADD CONSTRAINT article_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 5009 (class 2606 OID 16933)
-- Name: article_views article_views_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.article_views
    ADD CONSTRAINT article_views_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 16746)
-- Name: articles articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 16751)
-- Name: articles articles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4996 (class 2606 OID 16756)
-- Name: articles articles_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5010 (class 2606 OID 16948)
-- Name: attachment_download_logs attachment_download_logs_attachment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachment_download_logs
    ADD CONSTRAINT attachment_download_logs_attachment_id_fkey FOREIGN KEY (attachment_id) REFERENCES public.attachments(id) ON DELETE CASCADE;


--
-- TOC entry 5011 (class 2606 OID 16953)
-- Name: attachment_download_logs attachment_download_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachment_download_logs
    ADD CONSTRAINT attachment_download_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4997 (class 2606 OID 16774)
-- Name: attachments attachments_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;


--
-- TOC entry 4998 (class 2606 OID 16779)
-- Name: attachments attachments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5013 (class 2606 OID 16983)
-- Name: backup_tasks backup_tasks_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backup_tasks
    ADD CONSTRAINT backup_tasks_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.users(id);


--
-- TOC entry 5001 (class 2606 OID 16825)
-- Name: banners banners_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE SET NULL;


--
-- TOC entry 5002 (class 2606 OID 16830)
-- Name: banners banners_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 5003 (class 2606 OID 16835)
-- Name: banners banners_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4993 (class 2606 OID 16721)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 5012 (class 2606 OID 16968)
-- Name: operation_logs operation_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_logs
    ADD CONSTRAINT operation_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5004 (class 2606 OID 16850)
-- Name: site_settings site_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 4992 (class 2606 OID 16697)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE article_reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.article_reviews TO zgweb_user;


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 238
-- Name: SEQUENCE article_reviews_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.article_reviews_id_seq TO zgweb_user;


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 241
-- Name: TABLE article_revisions; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.article_revisions TO zgweb_user;


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 240
-- Name: SEQUENCE article_revisions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.article_revisions_id_seq TO zgweb_user;


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE article_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.article_tags TO zgweb_user;


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE article_views; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.article_views TO zgweb_user;


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 242
-- Name: SEQUENCE article_views_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.article_views_id_seq TO zgweb_user;


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE articles; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.articles TO zgweb_user;


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 223
-- Name: SEQUENCE articles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.articles_id_seq TO zgweb_user;


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 245
-- Name: TABLE attachment_download_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.attachment_download_logs TO zgweb_user;


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 244
-- Name: SEQUENCE attachment_download_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.attachment_download_logs_id_seq TO zgweb_user;


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE attachments; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.attachments TO zgweb_user;


--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 225
-- Name: SEQUENCE attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.attachments_id_seq TO zgweb_user;


--
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE backup_tasks; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.backup_tasks TO zgweb_user;


--
-- TOC entry 5218 (class 0 OID 0)
-- Dependencies: 248
-- Name: SEQUENCE backup_tasks_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.backup_tasks_id_seq TO zgweb_user;


--
-- TOC entry 5219 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE banners; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.banners TO zgweb_user;


--
-- TOC entry 5221 (class 0 OID 0)
-- Dependencies: 230
-- Name: SEQUENCE banners_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.banners_id_seq TO zgweb_user;


--
-- TOC entry 5222 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.categories TO zgweb_user;


--
-- TOC entry 5224 (class 0 OID 0)
-- Dependencies: 221
-- Name: SEQUENCE categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.categories_id_seq TO zgweb_user;


--
-- TOC entry 5225 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE friendly_links; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.friendly_links TO zgweb_user;


--
-- TOC entry 5227 (class 0 OID 0)
-- Dependencies: 236
-- Name: SEQUENCE friendly_links_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.friendly_links_id_seq TO zgweb_user;


--
-- TOC entry 5228 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE home_modules; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.home_modules TO zgweb_user;


--
-- TOC entry 5230 (class 0 OID 0)
-- Dependencies: 234
-- Name: SEQUENCE home_modules_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.home_modules_id_seq TO zgweb_user;


--
-- TOC entry 5231 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE operation_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.operation_logs TO zgweb_user;


--
-- TOC entry 5233 (class 0 OID 0)
-- Dependencies: 246
-- Name: SEQUENCE operation_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.operation_logs_id_seq TO zgweb_user;


--
-- TOC entry 5234 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.roles TO zgweb_user;


--
-- TOC entry 5236 (class 0 OID 0)
-- Dependencies: 217
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_id_seq TO zgweb_user;


--
-- TOC entry 5237 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE site_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.site_settings TO zgweb_user;


--
-- TOC entry 5239 (class 0 OID 0)
-- Dependencies: 232
-- Name: SEQUENCE site_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.site_settings_id_seq TO zgweb_user;


--
-- TOC entry 5240 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tags TO zgweb_user;


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE tags_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tags_id_seq TO zgweb_user;


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.users TO zgweb_user;


--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 219
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO zgweb_user;


--
-- TOC entry 2180 (class 826 OID 16990)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO zgweb_user;


--
-- TOC entry 2179 (class 826 OID 16989)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO zgweb_user;


-- Completed on 2026-04-02 14:54:46

--
-- PostgreSQL database dump complete
--

\unrestrict ZU497xVtf0hpDrg6zucDJbaCGSxi6rIhVMgHav5g0w9DFIkRyicdY6CmeL4dRsx

