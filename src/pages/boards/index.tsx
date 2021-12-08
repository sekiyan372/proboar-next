import { useEffect, useCallback } from 'react'
import { NextPage, GetStaticProps } from 'next'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import SuccessButton from '~/components/Button/SuccessButton'
import ArticleCard from '~/components/ArticleCard'
import Head from '~/components/Head'
import Heading from '~/components/Heading'
import Label from '~/components/Label'
import Select from '~/components/Select'
import { actions, getArticleIds, getEffectors } from '~/store'
import { articleConverter } from '~/utils/converter'
import { env } from '~/utils/env'
import { firestore } from '~/utils/firebase'
import { Article } from '~/types'

type Props = {
  articles?: Article[]
  errorCode?: number
}

type FormValues = {
  effectorId: string
}

const IndexBoard: NextPage<Props> = (props) => {
  const dispatch = useDispatch()
  const articleIds = useSelector(getArticleIds)
  const effectors = useSelector(getEffectors)

  const { register ,handleSubmit, formState: { errors }} = useForm<FormValues>({
    defaultValues: {
      effectorId: null,
    }
  })

  useEffect(() => {
    dispatch(actions.updateArticles(props.articles))
  }, [])

  const SubmitSerch = (value) => {
    // firestore()
    //   .collection("articles")
    //   .orderBy('createdAt', 'desc')
    //   .withConverter(articleConverter)
    //   .get()
    //   .then(({ docs, query }) => {
    //     const articles = []
    //     docs.forEach((doc) => {
    //       let isContain: boolean = false  // 含まれているかの判定値
    //       doc.data().effectorIds.forEach((obj) => {
    //         if(obj.id === value.effectorId) {
    //           isContain = true
    //         }
    //       })
    //       // 検索したエフェクターが含まれていたら配列に入れる
    //       if(isContain) {
    //         articles.push(doc.data())
    //       }
    //     })
    //     dispatch(actions.updateArticles(articles))
    //   })
    const serchArticles = props.articles.filter((article) => {
      article.effectorIds.includes(value.id)
      console.log(article.effectorIds)
      console.log(value.id)
    })
    dispatch(actions.updateArticles(serchArticles))
  }

  return (
    <>
      <Head title="エフェクターボード一覧" />
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
      </section>

      <section>
        <div className="m-12">
          <Heading>エフェクターボード一覧</Heading>
          <ul className="m-3 flex flex-wrap">
            {articleIds.map((articleId) => (
              <li key={ articleId }>
                <ArticleCard articleId={ articleId } />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const articles =
    await firestore()
      .collection("articles")
      .orderBy('createdAt', 'desc')
      .withConverter(articleConverter)
      .get()
      .then(({ docs }) => {
        const articles = docs.map((doc) => doc.data())
        return articles
      })

  return {
    props: { articles: articles },
    revalidate: env.IS_DEV ? 30 : 1,
  }
}

export default IndexBoard
