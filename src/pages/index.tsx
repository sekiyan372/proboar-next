import { NextPage } from 'next'
import Link from 'next/link'
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import SuccessButton from '~/components/Button/SuccessButton'
import ArticleCard from '~/components/ArticleCard'
import EffectorCard from '~/components/EffectorCard'
import Head from '~/components/Head'
import Heading from '~/components/Heading'
import Label from '~/components/Label'
import Select from '~/components/Select'
import { actions, getArticleIds, getEffectorIds, getEffectors } from '~/store'
import { articleConverter, effectorConverter } from '~/utils/converter'
import { firestore } from '~/utils/firebase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

const ARTICLES_PER_FETCH: number = 6
const EFFECTORS_PER_FETCH: number = 8

type FormValues = {
  effectorId: string
}

const Index: NextPage = () => {
  const dispatch = useDispatch()
  const articleIds = useSelector(getArticleIds)
  const effectorIds = useSelector(getEffectorIds)
  const effectors = useSelector(getEffectors)

  const { register ,handleSubmit, formState: { errors }} = useForm<FormValues>({
    defaultValues: {
      effectorId: null,
    }
  })

  const SubmitSerch = useCallback(async (value) => {
    firestore()
      .collection("articles")
      .orderBy('createdAt', 'desc')
      .withConverter(articleConverter)
      .get()
      .then(({ docs, query }) => {
        const articles = []
        docs.forEach((doc) => {
          let isContain: boolean = false  // 含まれているかの判定値
          doc.data().effectorIds.forEach((obj) => {
            if(obj.id === value.effectorId) {
              isContain = true
            }
          })
          // 検索したエフェクターが含まれていたら配列に入れる
          if(isContain) {
            articles.push(doc.data())
          }
        })
        dispatch(actions.updateArticles(articles))
      })
  }, [])

  useEffect(() => {
    firestore()
      .collection("articles")
      .orderBy('createdAt', 'desc')
      .limit(ARTICLES_PER_FETCH)
      .withConverter(articleConverter)
      .get()
      .then(({ docs, query }) => {
        const articles = docs.map((doc) => doc.data())
        dispatch(actions.updateArticles(articles))
      })

    firestore()
      .collection("effectors")
      .orderBy('createdAt', 'desc')
      .limit(EFFECTORS_PER_FETCH)
      .withConverter(effectorConverter)
      .get()
      .then(({ docs, query }) => {
        const effectors = docs.map((doc) => doc.data())
        dispatch(actions.updateEffectors(effectors))
      })
  }, [])

  return (
    <>
      <Head title="トップページ" />
      <section>
        <div className="m-12">
          <form onSubmit={ handleSubmit(SubmitSerch) }>
            <Label htmlFor="serch" className="text-green-500">エフェクターで検索</Label>
            <div className="flex">
              <Select
                className="py-2 w-5/6"
                id="serch"
                {...register('effectorId', { required: true })}
              >
                {effectors?.map((effector) => (
                  <option key={ effector.id } value={ effector.id }>
                    { effector.brand } { effector.name }
                  </option>
                ))}
              </Select>
              <SuccessButton className="w-15 rounded-md">検索</SuccessButton>
            </div>
            {errors.effectorId && errors.effectorId.type === 'required' && (
              <div role="alert" className="text-sm text-red-500">
                選択してください
              </div>
            )}
          </form>
        </div>

        <div className="m-12">
          <Heading>
            <span className="">新着エフェクターボード</span>
            <span className="float-right text-base text-blue-500">
              <Link href="/boards/index">もっとみる</Link>
              <span className="mx-1" />
              <FontAwesomeIcon icon={ faChevronRight } />
            </span>
          </Heading>
          <ul className="m-3 flex flex-wrap">
            {articleIds.map((articleId) => (
              <li key={ articleId }>
                <ArticleCard articleId={ articleId } />
              </li>
            ))}
            {articleIds.length === 0 && (
              <div>エフェクターボードはありません。</div>
            )}
          </ul>
        </div>

        <div className="m-12">
          <Heading>
            <span>新着登録エフェクター</span>
            <span className="float-right text-base text-blue-500">
              <Link href="/effectors/index">もっとみる</Link>
              <span className="mx-1" />
              <FontAwesomeIcon icon={ faChevronRight } />
            </span>
          </Heading>
          <ul className="m-3 flex flex-wrap">
            {effectorIds.map((effectorId) => (
              <li key={ effectorId }>
                <EffectorCard effectorId={ effectorId } />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export default Index
